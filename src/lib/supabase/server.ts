import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
if (!anon) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");

/**
 * Phase 1: minimal server client (no SSR auth persistence yet).
 * Phase 2 will add proper cookie-based auth helpers.
 */
export const supabaseServer = async () => {
  cookies(); // ensures this is server-side
  return createClient(url, anon);
};
