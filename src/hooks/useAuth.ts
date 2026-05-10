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
  const [configError, setConfigError] = useState<string>(
    isConfigured ? "" : "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );

  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      if (!isConfigured) {
        if (mounted) setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await refreshUserProfile(session.user.id);
        } else {
          if (mounted) setUser(null);
        }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    syncUser();

    if (!isConfigured) return;

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await refreshUserProfile(session.user.id);
      } else {
        if (mounted) setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const refreshUserProfile = async (supabaseUid: string) => {
    try {
      const { data: userRow } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_uid", supabaseUid)
        .single();

      if (!userRow) { setUser(null); return; }

      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("*")
        .eq("supabase_uid", supabaseUid)
        .eq("is_active", true)
        .maybeSingle();

      setUser({
        id: userRow.id,
        supabaseUid: userRow.supabase_uid,
        name: userRow.name,
        email: userRow.email,
        avatar: userRow.avatar,
        role: adminRow ? "admin" : userRow.role,
        kycStatus: userRow.kyc_status,
        isActive: userRow.is_active,
        isAdmin: !!adminRow,
        createdAt: userRow.created_at,
      });
    } catch {
      setUser(null);
    }
  };

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    if (!isConfigured) return { success: false, error: "Supabase not configured" };
    setIsLoading(true); setConfigError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: name || email.split("@")[0] } },
      });
      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Signup failed");

      await supabase.from("users").insert({
        supabase_uid: authData.user.id,
        email, name: name || email.split("@")[0],
        role: "user", kyc_status: "unverified", is_active: true,
      });

      await supabase.auth.signInWithPassword({ email, password });
      await refreshUserProfile(authData.user.id);
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Sign up failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isConfigured) return { success: false, error: "Supabase not configured" };
    setIsLoading(true); setConfigError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Login failed");

      const { data: existingUser } = await supabase
        .from("users").select("*").eq("supabase_uid", data.user.id).maybeSingle();

      if (!existingUser) {
        await supabase.from("users").insert({
          supabase_uid: data.user.id, email,
          name: data.user.user_metadata?.name || email.split("@")[0],
          role: "user", kyc_status: "unverified", is_active: true,
        });
      }
      await refreshUserProfile(data.user.id);
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Sign in failed" };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (isConfigured) await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  }, []);

  return { user, isAuthenticated: !!user, isAdmin: user?.isAdmin || false, isLoading, configError, signUp, signIn, logout };
}
