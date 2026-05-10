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
      // Try to find user profile
      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("supabase_uid", supabaseUid)
        .maybeSingle();

      if (userError) {
        console.error("[Auth] Error loading user profile:", userError.message);
        return null;
      }

      // If no profile exists, we need to create one
      if (!userRow) {
        return null;
      }

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
    } catch (err) {
      console.error("[Auth] loadUserProfile error:", err);
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
        console.error("[Auth] Profile insert error:", insertError.message, insertError.details);
        return null;
      }

      return inserted;
    } catch (err) {
      console.error("[Auth] createUserProfile error:", err);
      return null;
    }
  }, []);

  // Main auth state sync
  useEffect(() => {
    let mounted = true;

    const syncUser = async () => {
      if (!isConfigured) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          let profile = await loadUserProfile(session.user.id);

          // Auto-create profile if missing
          if (!profile) {
            console.log("[Auth] Profile not found, auto-creating...");
            const newProfile = await createUserProfile(session.user);
            if (newProfile) {
              profile = await loadUserProfile(session.user.id);
            }
          }

          if (mounted) setUser(profile);
        } else {
          if (mounted) setUser(null);
        }
      } catch (err) {
        console.error("[Auth] syncUser error:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    syncUser();

    if (!isConfigured) return;

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUserProfile, createUserProfile]);

  // Sign up
  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    if (!isConfigured) return { success: false, error: "Supabase not configured" };
    setIsLoading(true);

    try {
      // 1. Create in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split("@")[0] },
        },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Signup failed");

      // 2. Create profile in our users table
      const newProfile = await createUserProfile(authData.user);

      if (!newProfile) {
        console.warn("[Auth] Profile creation deferred — will retry on sign-in");
      }

      // 3. Auto sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw new Error(signInError.message);

      // 4. Load profile
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
      console.error("[Auth] Sign up error:", err);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Login failed");

      // Ensure user profile exists
      let profile = await loadUserProfile(data.user.id);
      if (!profile) {
        console.log("[Auth] Profile missing, auto-creating on sign-in...");
        await createUserProfile(data.user);
        profile = await loadUserProfile(data.user.id);
      }

      setUser(profile);
      return { success: true, error: null };
    } catch (err: any) {
      console.error("[Auth] Sign in error:", err);
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
