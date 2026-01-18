// src/app/api/send-email/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

type Payload = {
  emailId: string; // REQUIRED for attachments
  to: string[];
  subject: string;
  html: string;
};

type AttachmentRow = {
  storage_bucket: string;
  storage_path: string;
  file_name: string | null;
  content_type: string | null;
  file_size_bytes: number | null;
};

const resend = new Resend(process.env.RESEND_API_KEY);

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

function extractEmail(fromValue: string) {
  // Handles: "Chef Alex <contact@alexhardinan.com>" or "contact@alexhardinan.com"
  const m = fromValue.match(/<([^>]+)>/);
  const email = (m?.[1] ?? fromValue).trim();
  return email;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;
    const replyTo = process.env.RESEND_REPLY_TO;

    if (!apiKey) return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    if (!from) return NextResponse.json({ error: "Missing RESEND_FROM" }, { status: 500 });

    const body = (await req.json()) as Payload;

    if (!body.emailId?.trim()) return NextResponse.json({ error: "Missing emailId" }, { status: 400 });
    if (!Array.isArray(body.to) || body.to.length === 0) {
      return NextResponse.json({ error: "Missing recipients" }, { status: 400 });
    }
    if (!body.subject?.trim()) return NextResponse.json({ error: "Missing subject" }, { status: 400 });
    if (!body.html?.trim()) return NextResponse.json({ error: "Missing html" }, { status: 400 });

    const sb = supabaseAdmin();

    // Load attachments for this email
    const { data: attRows, error: attErr } = await sb
      .from("attachments")
      .select("storage_bucket,storage_path,file_name,content_type,file_size_bytes")
      .eq("email_id", body.emailId);

    if (attErr) {
      return NextResponse.json({ error: `Failed to load attachments: ${attErr.message}` }, { status: 500 });
    }

    const attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];

    // Safety limits (avoid provider/message failures)
    const MAX_FILES = 10;
    const MAX_EACH_BYTES = 10 * 1024 * 1024; // 10MB each
    const MAX_TOTAL_BYTES = 20 * 1024 * 1024; // 20MB total

    let totalBytes = 0;

    for (const row of (attRows ?? []) as AttachmentRow[]) {
      if (attachments.length >= MAX_FILES) break;

      const bucket = row.storage_bucket || "chef-alex-attachments";
      const path = row.storage_path;

      if (!bucket || !path) continue;

      // If size known, enforce limits
      const size = row.file_size_bytes ?? 0;
      if (size > MAX_EACH_BYTES) {
        return NextResponse.json(
          { error: `Attachment too large: ${row.file_name ?? path} (max 10MB each)` },
          { status: 400 }
        );
      }
      if (totalBytes + size > MAX_TOTAL_BYTES) {
        return NextResponse.json({ error: `Total attachments too large (max 20MB total)` }, { status: 400 });
      }

      const { data: fileBlob, error: dlErr } = await sb.storage.from(bucket).download(path);
      if (dlErr) {
        return NextResponse.json({ error: `Failed to download attachment: ${dlErr.message}` }, { status: 500 });
      }
      if (!fileBlob) continue;

      const ab = await fileBlob.arrayBuffer();
      const buf = Buffer.from(ab);

      totalBytes += buf.byteLength;

      attachments.push({
        filename: row.file_name ?? path.split("/").pop() ?? "attachment",
        content: buf,
        ...(row.content_type ? { contentType: row.content_type } : {}),
      });
    }

    // ✅ Privacy fix:
    // Send to your own address (or the "from" mailbox) and put real recipients in BCC.
    // This prevents recipients from seeing each other.
    const primaryTo = extractEmail(from);

    const { data, error } = await resend.emails.send({
      from,
      to: [primaryTo],
      bcc: body.to,
      subject: body.subject,
      html: body.html,
      ...(replyTo ? { replyTo } : {}),
      ...(attachments.length > 0 ? { attachments } : {}),
    });

    if (error) return NextResponse.json({ error }, { status: 400 });

    return NextResponse.json({ ok: true, resend: data, attachments_sent: attachments.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown server error" }, { status: 500 });
  }
}
