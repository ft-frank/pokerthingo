import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components (browser).
 * Reads the project URL + anon key from public env vars, so nothing
 * secret is exposed — the anon key is meant to be public.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** True when the two public env vars have been provided. */
export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
