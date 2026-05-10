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
  const [configError] = useState<string>(
    isConfigured ? "" : "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );

  // Fetch user profile from database
  const loadUserProfile = useCallback(async (supabaseUid: string): Promise<AuthUser | null> => {
    try {
      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_uid", supabaseUid)
        .maybeSingle();

      if (userError || !userRow) return null;

      // Check admin status
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("*")
        .eq("supabase_uid", supabaseUid)
        .eq("is_active", true)
        .maybeSingle();

      return {
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
      };
    } catch {
      return null;
    }
  }, []);

  // Create user profile in database
  const createUserProfile = useCallback(async (sbUser: { id: string; email?: string; user_metadata?: { name?: string } }) => {
    try {
      const email = sbUser.email || "no-email@example.com";
      const name = sbUser.user_metadata?.name || email.split("@")[0];

      const { data: inserted, error: insertError } = await supabase
        .from("users")
        .insert({
          supabase_uid: sbUser.id,
          email: email,
          name: name,
          role: "user",
          kyc_status: "unverified",
          is_active: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error("[Auth] Profile insert error:", insertError.message);
        return null;
      }
      return inserted;
    } catch {
      return null;
    }
  }, []);

  // Main auth state sync - runs once on mount
  useEffect(() => {
    let mounted = true;
    let listener: { subscription: { unsubscribe: () => void } } | null = null;

    const syncUser = async () => {
      // When not configured, just stop loading immediately
      if (!isConfigured) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          let profile = await loadUserProfile(session.user.id);
          if (!profile) {
            const newProfile = await createUserProfile(session.user);
            if (newProfile) profile = await loadUserProfile(session.user.id);
          }
          if (mounted) setUser(profile);
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

    // Only set up listener when configured
    if (isConfigured) {
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          let profile = await loadUserProfile(session.user.id);
          if (!profile) {
            await createUserProfile(session.user);
            profile = await loadUserProfile(session.user.id);
          }
          if (mounted) setUser(profile);
        } else {
          if (mounted) setUser(null);
        }
      });
    }

    return () => {
      mounted = false;
      if (listener) listener.subscription.unsubscribe();
    };
  }, [loadUserProfile, createUserProfile]);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    if (!isConfigured) return { success: false, error: "Supabase not configured" };
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name || email.split("@")[0] } },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Signup failed");

      await createUserProfile(authData.user);

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw new Error(signInError.message);

      if (signInData.user) {
        let profile = await loadUserProfile(signInData.user.id);
        if (!profile) {
          await createUserProfile(signInData.user);
          profile = await loadUserProfile(signInData.user.id);
        }
        setUser(profile);
      }

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Sign up failed" };
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile, createUserProfile]);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    if (!isConfigured) return { success: false, error: "Supabase not configured" };
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Login failed");

      let profile = await loadUserProfile(data.user.id);
      if (!profile) {
        await createUserProfile(data.user);
        profile = await loadUserProfile(data.user.id);
      }
      setUser(profile);
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || "Sign in failed" };
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile, createUserProfile]);

  // Log out
  const logout = useCallback(async () => {
    if (isConfigured) await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isLoading,
    configError,
    signUp,
    signIn,
    logout,
  };
}
