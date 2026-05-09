import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { trpc } from "@/providers/trpc";

type AuthUser = {
  id: number;
  supabaseUid: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
  kycStatus: string;
  isActive: boolean;
  createdAt: Date;
};

export function useAuth() {
  const utils = trpc.useUtils();
  const [hasSession, setHasSession] = useState(false);

  // Listen to Supabase auth state
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session);
    });
    // Check initial session
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Fetch user profile from our backend
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: hasSession,
  });

  // Sign up mutation
  const signUpMutation = trpc.auth.signUp.useMutation({
    onSuccess: (data) => {
      if (data.token) {
        supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refreshToken,
        });
      }
      utils.invalidate();
    },
  });

  // Sign in mutation
  const signInMutation = trpc.auth.signIn.useMutation({
    onSuccess: (data) => {
      if (data.token) {
        supabase.auth.setSession({
          access_token: data.token,
          refresh_token: data.refreshToken,
        });
      }
      utils.invalidate();
    },
  });

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    utils.invalidate();
    window.location.href = "/login";
  }, [utils]);

  const user = userData as AuthUser | null | undefined;
  const isLoading = userLoading || signUpMutation.isPending || signInMutation.isPending;

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || user?.role === "manager",
    isLoading,
    error: userError,
    signUp: signUpMutation.mutate,
    signIn: signInMutation.mutate,
    signUpPending: signUpMutation.isPending,
    signInPending: signInMutation.isPending,
    signUpError: signUpMutation.error,
    signInError: signInMutation.error,
    logout,
  };
}
