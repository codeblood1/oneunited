import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Check if values are real or still placeholders
const _isConfigured =
  supabaseUrl.length > 0 &&
  !supabaseUrl.includes("YOUR-PROJECT-REF") &&
  !supabaseUrl.includes("REPLACE") &&
  supabaseAnonKey.length > 0 &&
  !supabaseAnonKey.includes("REPLACE-THIS");

// For unconfigured state, use a minimal valid URL to prevent client creation errors
// but disable all background activity
const safeUrl = _isConfigured ? supabaseUrl : "http://localhost:54321";
const safeKey = _isConfigured ? supabaseAnonKey : "dummy-key";

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    autoRefreshToken: _isConfigured,  // Only refresh when properly configured
    persistSession: true,
    detectSessionInUrl: false,         // Disable to prevent conflicts with HashRouter
    storageKey: "oneunited_auth",
  },
  global: {
    // Add request timeout to prevent hanging
    headers: _isConfigured ? undefined : { "X-Client-Info": "oneunited" },
  },
});

// Also export a flag that modules can check synchronously
export const isConfigured = _isConfigured;
