import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "";
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isConfigured =
  url.length > 0 &&
  !url.includes("YOUR-PROJECT") &&
  !url.includes("REPLACE") &&
  key.length > 0 &&
  !key.includes("REPLACE");

export const supabase = createClient(
  isConfigured ? url : "http://localhost:54321",
  isConfigured ? key : "dummy-key",
  {
    auth: {
      autoRefreshToken: isConfigured,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: "oneunited_auth",
    },
  }
);
