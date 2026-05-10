// Supabase client — creates a safe client even when URL is missing
// The app will show a config error instead of crashing

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if values are real or still placeholders
const isConfigured =
  supabaseUrl.length > 0 &&
  !supabaseUrl.includes("YOUR-PROJECT-REF") &&
  !supabaseUrl.includes("REPLACE") &&
  supabaseAnonKey.length > 0 &&
  !supabaseAnonKey.includes("REPLACE-THIS");

// Create a dummy URL for when not configured (prevents crash on import)
const safeUrl = isConfigured ? supabaseUrl : "http://localhost-placeholder";
const safeKey = isConfigured ? supabaseAnonKey : "placeholder-key";

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: "oneunited_auth",
  },
});

export { isConfigured };
