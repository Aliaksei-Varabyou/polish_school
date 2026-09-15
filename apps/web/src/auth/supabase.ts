// Supabase client: created lazily (separate chunk) and only when the portal is configured for accounts.
import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** accounts are enabled when both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set */
export const authEnabled = Boolean(url && anonKey);
export const googleEnabled = authEnabled && import.meta.env.VITE_SUPABASE_GOOGLE === "true";

let client: Promise<SupabaseClient | null> | null = null;

/** Singleton client, or null when accounts are not configured. */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!authEnabled) return Promise.resolve(null);
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }),
  );
  return client;
}

/** Current access token (refreshed by supabase-js when needed), or null for guests. */
export async function getAccessToken(): Promise<string | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
