import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Payload = {
  emailId: string;
  mode: "soft" | "hard" | "restore";
};

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    if (!body.emailId?.trim()) return NextResponse.json({ error: "Missing emailId" }, { status: 400 });
    if (body.mode !== "soft" && body.mode !== "hard" && body.mode !== "restore") {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";

    if (!token) return NextResponse.json({ error: "Missing auth token" }, { status: 401 });

    const sb = supabaseAdmin();

    // Verify caller identity from Supabase JWT
    const { data: userData, error: userErr } = await sb.auth.getUser(token);
    if (userErr || !userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const uid = userData.user.id;

    // Confirm ownership
    const { data: emailRow, error: emailErr } = await sb
      .from("emails")
      .select("id,owner_uuid,status")
      .eq("id", body.emailId)
      .single();

    if (emailErr) return NextResponse.json({ error: emailErr.message }, { status: 400 });
    if (!emailRow || emailRow.owner_uuid !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // SOFT DELETE -> move to deleted
    if (body.mode === "soft") {
      const { error } = await sb.from("emails").update({ status: "deleted" }).eq("id", body.emailId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, mode: "soft" });
    }

    // RESTORE -> move back to draft
    if (body.mode === "restore") {
      const { error } = await sb.from("emails").update({ status: "draft" }).eq("id", body.emailId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, mode: "restore" });
    }

    // HARD DELETE: remove storage objects + DB rows (attachments, logs, email)
    const { data: atts, error: attErr } = await sb
      .from("attachments")
      .select("id,storage_bucket,storage_path")
      .eq("email_id", body.emailId);

    if (attErr) return NextResponse.json({ error: attErr.message }, { status: 400 });

    // Remove files from storage (group by bucket)
    const byBucket = new Map<string, string[]>();
    for (const a of (atts ?? []) as any[]) {
      const b = a.storage_bucket || "chef-alex-attachments";
      const p = a.storage_path;
      if (!p) continue;
      if (!byBucket.has(b)) byBucket.set(b, []);
      byBucket.get(b)!.push(p);
    }

    for (const [bucket, paths] of byBucket.entries()) {
      if (paths.length === 0) continue;
      const { error: rmErr } = await sb.storage.from(bucket).remove(paths);
      if (rmErr) return NextResponse.json({ error: `Storage remove failed: ${rmErr.message}` }, { status: 400 });
    }

    const { error: delAttErr } = await sb.from("attachments").delete().eq("email_id", body.emailId);
    if (delAttErr) return NextResponse.json({ error: delAttErr.message }, { status: 400 });

    const { error: delLogErr } = await sb.from("email_logs").delete().eq("email_id", body.emailId);
    if (delLogErr) return NextResponse.json({ error: delLogErr.message }, { status: 400 });

    const { error: delEmailErr } = await sb.from("emails").delete().eq("id", body.emailId);
    if (delEmailErr) return NextResponse.json({ error: delEmailErr.message }, { status: 400 });

    return NextResponse.json({ ok: true, mode: "hard" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown server error" }, { status: 500 });
  }
}
