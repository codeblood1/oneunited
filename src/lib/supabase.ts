import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Validate at runtime — throw a clear error if not configured
if (!supabaseUrl || supabaseUrl.includes("YOUR-PROJECT-REF")) {
  throw new Error(
    "Supabase URL is missing or invalid.\n\n" +
    "Make sure you set these environment variables in Vercel:\n" +
    "  VITE_SUPABASE_URL=https://your-project-ref.supabase.co\n" +
    "  VITE_SUPABASE_ANON_KEY=your-anon-key\n\n" +
    "Then redeploy."
  );
}

if (!supabaseAnonKey || supabaseAnonKey.includes("REPLACE-THIS")) {
  throw new Error(
    "Supabase Anon Key is missing or invalid.\n\n" +
    "Make sure you set VITE_SUPABASE_ANON_KEY in Vercel, then redeploy."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type SupabaseClient = typeof supabase;
