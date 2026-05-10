import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  Landmark, Mail, Lock, User, Eye, EyeOff, ArrowRight,
  Shield, Loader2, AlertTriangle, ExternalLink,
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading: authLoading, configError } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect when user becomes authenticated
  useEffect(() => {
    if (user && !authLoading) {
      const dest = user.isAdmin ? "/admin" : "/dashboard";
      navigate(dest);
    }
  }, [user, authLoading, navigate]);

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Already authenticated - show redirecting state
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (submitting) return;

    setError("");
    setSubmitting(true);

    try {
      if (mode === "signin") {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        }
        // Redirect handled by useEffect when user state updates
      } else {
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setSubmitting(false);
          return;
        }
        const result = await signUp(email, password, name || undefined);
        if (result.error) {
          setError(result.error);
        }
        // Redirect handled by useEffect when user state updates
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#fbbf24] flex items-center justify-center shadow-lg shadow-amber-400/25">
            <Landmark className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">OneUnited</span>
        </div>

        {configError && (
          <div className="mb-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Supabase Not Configured</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Set your Supabase project URL and anon key before auth will work.
                </p>
                <div className="mt-2 p-2 rounded-lg bg-white/80 dark:bg-slate-800 text-xs font-mono text-red-800 dark:text-red-300 space-y-1">
                  <p>VITE_SUPABASE_URL=https://your-project.supabase.co</p>
                  <p>VITE_SUPABASE_ANON_KEY=your-anon-key</p>
                </div>
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-red-700 dark:text-red-400 hover:underline">
                  Get free Supabase project <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {mode === "signin" ? "Sign in to access your banking dashboard" : "Sign up to start banking with us"}
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            {/* Toggle buttons - MUST be outside the form */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1">
              <button
                type="button"
                onClick={() => { if (!submitting) { setMode("signin"); setError(""); } }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signin" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { if (!submitting) { setMode("signup"); setError(""); } }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signup" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
                Sign Up
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? "text" : "password"}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                    required minLength={mode === "signup" ? 6 : 1}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-xl h-12 text-base shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-4 justify-center pt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />256-bit encrypted
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />Supabase Auth
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">By signing in, you agree to our Terms and Privacy Policy</p>
      </div>
    </div>
  );
}
