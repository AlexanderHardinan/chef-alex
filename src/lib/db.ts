import { supabaseBrowser } from "@/lib/supabase/browser";

export async function requireUserId() {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export async function getSessionAccessToken() {
  const supabase = supabaseBrowser();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  const token = data.session?.access_token;
  if (!token) throw new Error("Missing access token");
  return token;
}
