import { useState, useEffect, useCallback } from "react";
import { supabase, isConfigured } from "@/lib/supabase";

type AuthUser = {
  id: number;
  supabaseUid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
  kycStatus: string;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: string;
};

// ======== MODULE-LEVEL SHARED STATE ========
// All hook instances share this state via subscriptions
let _user: AuthUser | null = null;
let _loading = true;
const _listeners = new Set<(u: AuthUser | null, l: boolean) => void>();

function _setUser(user: AuthUser | null) {
  _user = user;
  _listeners.forEach((fn) => fn(_user, _loading));
}

function _setLoading(loading: boolean) {
  _loading = loading;
  _listeners.forEach((fn) => fn(_user, _loading));
}

function _notify() {
  _listeners.forEach((fn) => fn(_user, _loading));
}

// Build user from DB rows
async function loadProfile(sbUid: string): Promise<AuthUser | null> {
  const [{ data: row }, { data: adminRow }] = await Promise.all([
    supabase.from("users").select("*").eq("supabase_uid", sbUid).maybeSingle(),
    supabase.from("admin_users").select("id").eq("supabase_uid", sbUid).eq("is_active", true).maybeSingle(),
  ]);

  if (!row) return null;

  return {
    id: row.id,
    supabaseUid: row.supabase_uid,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    role: adminRow ? "admin" : row.role,
    kycStatus: row.kyc_status,
    isActive: row.is_active,
    isAdmin: !!adminRow,
    createdAt: row.created_at,
  };
}

// Sync from Supabase session — updates shared state
async function syncFromSession() {
  if (!isConfigured) {
    _setLoading(false);
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;

  if (uid) {
    const profile = await loadProfile(uid);
    _setUser(profile);
  } else {
    _setUser(null);
  }
  _setLoading(false);
}

// Initialize once on module load
let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;

  if (!isConfigured) {
    _setLoading(false);
    return;
  }

  syncFromSession();
}

// ======== REACT HOOK ========
export function useAuth() {
  // Subscribe to shared module state
  const [, setTick] = useState(0);

  useEffect(() => {
    init();

    const onChange = () => setTick((t) => t + 1);
    _listeners.add(onChange);
    return () => {
      _listeners.delete(onChange);
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isConfigured) return { error: "Supabase not configured" };
    _setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      _setLoading(false);
      return { error: error.message };
    }
    if (!data.user) {
      _setLoading(false);
      return { error: "Login failed" };
    }

    // Load or create profile
    let profile = await loadProfile(data.user.id);
    if (!profile) {
      await supabase.from("users").insert({
        supabase_uid: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.name || email.split("@")[0],
        role: "user",
        kyc_status: "unverified",
        is_active: true,
      });
      profile = await loadProfile(data.user.id);
    }

    _setUser(profile);
    _setLoading(false);
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    if (!isConfigured) return { error: "Supabase not configured" };
    _setLoading(true);

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name || email.split("@")[0] } },
    });

    if (authErr) {
      _setLoading(false);
      return { error: authErr.message };
    }
    if (!authData.user) {
      _setLoading(false);
      return { error: "Signup failed" };
    }

    // Create profile
    await supabase.from("users").insert({
      supabase_uid: authData.user.id,
      email,
      name: name || email.split("@")[0],
      role: "user",
      kyc_status: "unverified",
      is_active: true,
    });

    // Auto sign in
    const { data: signInData, error: signInErr } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      _setLoading(false);
      return { error: signInErr.message };
    }

    if (signInData.user) {
      const profile = await loadProfile(signInData.user.id);
      _setUser(profile);
    }
    _setLoading(false);
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    if (isConfigured) await supabase.auth.signOut();
    _setUser(null);
    window.location.replace("#/login");
  }, []);

  return {
    user: _user,
    isAuthenticated: !!_user,
    isAdmin: _user?.isAdmin || false,
    isLoading: _loading,
    configError: isConfigured ? "" : "Supabase not configured",
    signIn,
    signUp,
    logout,
  };
}
