import { useState, useEffect, useCallback, useRef } from "react";
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

// Build a user object from DB row + admin check
function buildUser(row: Record<string, any>, isAdmin: boolean): AuthUser {
  return {
    id: row.id,
    supabaseUid: row.supabase_uid,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    role: isAdmin ? "admin" : row.role,
    kycStatus: row.kyc_status,
    isActive: row.is_active,
    isAdmin,
    createdAt: row.created_at,
  };
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Use ref to track the current supabase auth user to avoid stale closures
  const sessionRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (sbUid: string): Promise<AuthUser | null> => {
    const [{ data: row, error: rowErr }, { data: adminRow }] = await Promise.all([
      supabase.from("users").select("*").eq("supabase_uid", sbUid).maybeSingle(),
      supabase.from("admin_users").select("id").eq("supabase_uid", sbUid).eq("is_active", true).maybeSingle(),
    ]);

    if (rowErr || !row) return null;
    return buildUser(row, !!adminRow);
  }, []);

  // Single source of truth for setting auth state
  const syncAuth = useCallback(async () => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id ?? null;

    if (uid) {
      const profile = await fetchProfile(uid);
      sessionRef.current = uid;
      setUser(profile);
    } else {
      sessionRef.current = null;
      setUser(null);
    }
    setIsLoading(false);
  }, [fetchProfile]);

  // Check session on mount only
  useEffect(() => {
    syncAuth();
  }, [syncAuth]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isConfigured) return { error: "Supabase not configured" };

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (!data.user) return { error: "Login failed" };

      // Load profile — if null, try to create one
      let profile = await fetchProfile(data.user.id);
      if (!profile) {
        await supabase.from("users").insert({
          supabase_uid: data.user.id,
          email: data.user.email || email,
          name: data.user.user_metadata?.name || email.split("@")[0],
          role: "user",
          kyc_status: "unverified",
          is_active: true,
        });
        profile = await fetchProfile(data.user.id);
      }

      sessionRef.current = data.user.id;
      setUser(profile);
      return { error: null };
    },
    [fetchProfile]
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      if (!isConfigured) return { error: "Supabase not configured" };

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split("@")[0] } },
      });
      if (authErr) return { error: authErr.message };
      if (!authData.user) return { error: "Signup failed" };

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

      if (signInErr) return { error: signInErr.message };

      if (signInData.user) {
        const profile = await fetchProfile(signInData.user.id);
        sessionRef.current = signInData.user.id;
        setUser(profile);
      }
      return { error: null };
    },
    [fetchProfile]
  );

  const logout = useCallback(async () => {
    if (isConfigured) await supabase.auth.signOut();
    sessionRef.current = null;
    setUser(null);
    window.location.replace("#/login");
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isLoading,
    configError: isConfigured ? "" : "Supabase not configured",
    signIn,
    signUp,
    logout,
  };
}
