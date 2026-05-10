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

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (sbUid: string): Promise<AuthUser | null> => {
    const { data: row } = await supabase
      .from("users")
      .select("*")
      .eq("supabase_uid", sbUid)
      .maybeSingle();
    if (!row) return null;

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("supabase_uid", sbUid)
      .eq("is_active", true)
      .maybeSingle();

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
  }, []);

  // Check session once on mount
  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const uid = data.session?.user?.id;
      if (uid) {
        loadProfile(uid).then((profile) => {
          if (!cancelled) {
            setUser(profile);
            setIsLoading(false);
          }
        });
      } else {
        setIsLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      const uid = session?.user?.id;
      if (uid) {
        loadProfile(uid).then((profile) => {
          if (!cancelled) setUser(profile);
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isConfigured) return { error: "Supabase not configured" };
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }
      if (data.user) {
        const profile = await loadProfile(data.user.id);
        setUser(profile);
      }
      setIsLoading(false);
      return { error: null };
    },
    [loadProfile]
  );

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      if (!isConfigured) return { error: "Supabase not configured" };
      setIsLoading(true);

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split("@")[0] } },
      });

      if (authErr) {
        setIsLoading(false);
        return { error: authErr.message };
      }

      // Create profile
      if (authData.user) {
        await supabase.from("users").insert({
          supabase_uid: authData.user.id,
          email: email,
          name: name || email.split("@")[0],
          role: "user",
          kyc_status: "unverified",
          is_active: true,
        });

        // Auto sign in
        const { data: signInData, error: signInErr } =
          await supabase.auth.signInWithPassword({ email, password });

        if (!signInErr && signInData.user) {
          const profile = await loadProfile(signInData.user.id);
          setUser(profile);
        }
      }

      setIsLoading(false);
      return { error: null };
    },
    [loadProfile]
  );

  const logout = useCallback(async () => {
    if (isConfigured) await supabase.auth.signOut();
    setUser(null);
    window.location.href = "#/login";
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
