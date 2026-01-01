import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Payload = {
  bucket: string;
  path: string;
};

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;

    if (!body.bucket?.trim()) {
      return NextResponse.json({ error: "Missing bucket" }, { status: 400 });
    }
    if (!body.path?.trim()) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // 10 minutes
    const { data, error } = await sb.storage.from(body.bucket).createSignedUrl(body.path, 60 * 10);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true, url: data.signedUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown server error" }, { status: 500 });
  }
}
