// ============================================================
// Server-side Supabase client — uses SERVICE ROLE key
// ONLY use this on the server (never in browser code!)
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

export const supabaseServer = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Verify a Supabase JWT token and return the user
export async function verifySupabaseToken(token: string) {
  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
