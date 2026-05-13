import { Routes, Route, Navigate } from "react-router";
import { Component, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Transfer from "./pages/Transfer";
import Verification from "./pages/Verification";
import Settings from "./pages/Settings";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";
import AdminKYC from "./pages/AdminKYC";
import AdminAccounts from "./pages/AdminAccounts";
import AdminCards from "./pages/AdminCards";
import Cards from "./pages/Cards";
import NotFound from "./pages/NotFound";

function AuthLoader() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#fbbf24] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
          <span className="text-2xl text-red-600">!</span>
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full px-6 py-2.5 text-sm transition-all"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

// Error boundary wrapper
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, error: err.message };
  }
  render() {
    if (this.state.hasError) {
      return <ErrorScreen message={this.state.error} />;
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children, adminOnly }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isAdmin, isLoading } = useAuth();
  if (isLoading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
}

function LoginRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <AuthLoader />;
  if (user) return <Navigate to={user.isAdmin ? "/admin" : "/dashboard"} replace />;
  return <Login />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
        <Route path="/verification" element={<ProtectedRoute><Verification /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/transactions" element={<ProtectedRoute adminOnly><AdminTransactions /></ProtectedRoute>} />
        <Route path="/admin/kyc" element={<ProtectedRoute adminOnly><AdminKYC /></ProtectedRoute>} />
        <Route path="/admin/accounts" element={<ProtectedRoute adminOnly><AdminAccounts /></ProtectedRoute>} />
        <Route path="/admin/cards" element={<ProtectedRoute adminOnly><AdminCards /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
