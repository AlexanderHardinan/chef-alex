import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey);
}

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Missing RESEND_WEBHOOK_SECRET" }, { status: 500 });
  }

  // Resend requires verifying webhooks using payload + svix headers + secret. :contentReference[oaicite:5]{index=5}
  const payload = await req.text();

  const svixId = req.headers.get("svix-id") ?? "";
  const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
  const svixSignature = req.headers.get("svix-signature") ?? "";

  let event: any;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      secret,
    });
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  // We only need "any open"
  if (event?.type !== "email.opened") {
    return NextResponse.json({ ok: true });
  }

  const resendEmailId = event?.data?.email_id as string | undefined;
  if (!resendEmailId) return NextResponse.json({ ok: true });

  const sb = supabaseAdmin();

  // Mark opened (only set opened_at if not already set)
  const { data: rows, error } = await sb
    .from("emails")
    .select("id, opened_at")
    .eq("resend_id", resendEmailId)
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!rows || rows.length === 0) return NextResponse.json({ ok: true });

  const emailRow = rows[0];

  if (!emailRow.opened_at) {
    await sb
      .from("emails")
      .update({ opened_at: new Date().toISOString(), last_event: "email.opened" })
      .eq("id", emailRow.id);

    await sb.from("email_logs").insert({
      owner_uuid: null, // optional: keep null for system logs, or skip this insert if your schema requires owner_uuid
      email_id: emailRow.id,
      action: "opened_email",
      details: event,
    });
  } else {
    await sb.from("emails").update({ last_event: "email.opened" }).eq("id", emailRow.id);
  }

  return NextResponse.json({ ok: true });
}
