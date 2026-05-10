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
  const { signIn, signUp, user, isLoading, configError } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Redirect when logged in
  useEffect(() => {
    if (user) {
      navigate(user.isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);

    const result =
      mode === "signin"
        ? await signIn(email, password)
        : await signUp(email, password, name || undefined);

    if (result.error) setError(result.error);
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#fbbf24] flex items-center justify-center shadow-lg">
            <Landmark className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">OneUnited</span>
        </div>

        {/* Config warning */}
        {configError && (
          <div className="mb-4 p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Supabase Not Configured</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.</p>
                <a href="https://supabase.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-red-700 dark:text-red-400 hover:underline">
                  Get free Supabase project <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {mode === "signin" ? "Sign in to your account" : "Sign up to get started"}
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            {/* Mode toggle — outside form */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-700 p-1">
              <button type="button" onClick={() => { setMode("signin"); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signin" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>
                Sign In
              </button>
              <button type="button" onClick={() => { setMode("signup"); setError(""); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === "signup" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"}`}>
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-300" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-300" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                    required minLength={mode === "signup" ? 6 : 1}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-300" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={busy || isLoading}
                className="w-full bg-[#fbbf24] hover:bg-amber-500 disabled:opacity-60 text-slate-900 font-semibold rounded-xl h-12 text-base shadow-md flex items-center justify-center gap-2 transition-all">
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="flex items-center gap-4 justify-center pt-2">
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />256-bit encrypted
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />Supabase Auth
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
