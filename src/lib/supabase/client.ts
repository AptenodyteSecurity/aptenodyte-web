import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

/** Browser / Client Component Supabase client (anon/publishable key only). */
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}

/** Browser client for email links that return a session in the URL fragment. */
export function createImplicitAuthClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      flowType: "implicit",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
