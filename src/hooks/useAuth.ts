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
let _user: AuthUser | null = null;
let _loading = true;
let _error = "";
const _listeners = new Set<() => void>();

function emit() {
  _listeners.forEach((fn) => fn());
}

function setU(u: AuthUser | null) { _user = u; emit(); }
function setL(l: boolean) { _loading = l; emit(); }
function setE(e: string) { _error = e; emit(); }

async function loadProfile(sbUid: string): Promise<AuthUser | null> {
  try {
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
  } catch {
    return null;
  }
}

async function ensureProfile(sbUser: { id: string; email?: string; user_metadata?: { name?: string } }) {
  let profile = await loadProfile(sbUser.id);
  if (!profile) {
    try {
      const email = sbUser.email || "user@example.com";
      await supabase.from("users").insert({
        supabase_uid: sbUser.id,
        email,
        name: sbUser.user_metadata?.name || email.split("@")[0],
        role: "user",
        kyc_status: "unverified",
        is_active: true,
      });
      profile = await loadProfile(sbUser.id);
    } catch {
      // ignore insert error, try loading again
      profile = await loadProfile(sbUser.id);
    }
  }
  return profile;
}

// Init with timeout guard — NEVER stays loading forever
let initDone = false;
function doInit() {
  if (initDone) return;
  initDone = true;

  if (!isConfigured) {
    setL(false);
    return;
  }

  // Safety timeout: force loading=false after 8 seconds no matter what
  const safetyTimeout = setTimeout(() => {
    if (_loading) {
      setE("Auth check timed out. Check your Supabase connection.");
      setL(false);
    }
  }, 8000);

  supabase.auth.getSession()
    .then(({ data: { session } }) => {
      clearTimeout(safetyTimeout);
      const uid = session?.user?.id;
      if (uid) {
        return loadProfile(uid).then((profile) => {
          setU(profile);
          setL(false);
        });
      } else {
        setU(null);
        setL(false);
      }
    })
    .catch((err: any) => {
      clearTimeout(safetyTimeout);
      setE(err?.message || "Failed to check session");
      setU(null);
      setL(false);
    });
}

// ======== REACT HOOK ========
export function useAuth() {
  const [, setTick] = useState(0);

  useEffect(() => {
    doInit();
    const cb = () => setTick((t) => t + 1);
    _listeners.add(cb);
    // Emit immediately so component reads current shared state
    cb();
    return () => { _listeners.delete(cb); };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isConfigured) return { error: "Supabase not configured" };
    setE("");
    setL(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setL(false); return { error: error.message }; }
      if (!data.user) { setL(false); return { error: "Login failed" }; }

      const profile = await ensureProfile(data.user);
      setU(profile);
      setL(false);
      return { error: null };
    } catch (err: any) {
      setL(false);
      return { error: err?.message || "Network error" };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    if (!isConfigured) return { error: "Supabase not configured" };
    setE("");
    setL(true);

    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: name || email.split("@")[0] } },
      });
      if (authErr) { setL(false); return { error: authErr.message }; }
      if (!authData.user) { setL(false); return { error: "Signup failed" }; }

      await supabase.from("users").insert({
        supabase_uid: authData.user.id,
        email,
        name: name || email.split("@")[0],
        role: "user",
        kyc_status: "unverified",
        is_active: true,
      });

      const { data: signInData, error: signInErr } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInErr) { setL(false); return { error: signInErr.message }; }

      if (signInData.user) {
        const profile = await loadProfile(signInData.user.id);
        setU(profile);
      }
      setL(false);
      return { error: null };
    } catch (err: any) {
      setL(false);
      return { error: err?.message || "Network error" };
    }
  }, []);

  const logout = useCallback(async () => {
    if (isConfigured) {
      try { await supabase.auth.signOut(); } catch { /* ignore */ }
    }
    setU(null);
    window.location.replace("#/login");
  }, []);

  return {
    user: _user,
    isAuthenticated: !!_user,
    isAdmin: _user?.isAdmin || false,
    isLoading: _loading,
    error: _error,
    configError: isConfigured ? "" : "Supabase not configured",
    signIn,
    signUp,
    logout,
  };
}
