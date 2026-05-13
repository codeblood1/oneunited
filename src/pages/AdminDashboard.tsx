import { useAuth } from "@/hooks/useAuth";
import { useAdminStats } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import {
  Users, Wallet, Receipt, Clock, ShieldCheck, DollarSign, CreditCard,
  ArrowUpRight, ArrowDownRight, UserCheck, Landmark,
  ChevronRight, TrendingUp, AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading } = useAdminStats();

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400", nav: "/admin/users", trend: "+12%", up: true },
    { label: "Total Accounts", value: stats?.totalAccounts ?? 0, icon: Wallet, color: "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400", nav: "/admin/accounts", trend: "+8%", up: true },
    { label: "Total Transactions", value: stats?.totalTransactions ?? 0, icon: Receipt, color: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400", nav: "/admin/transactions", trend: "+24%", up: true },
    { label: "Pending Tx", value: stats?.pendingTransactions ?? 0, icon: Clock, color: "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400", nav: "/admin/transactions", trend: "Needs review", up: false, alert: true },
    { label: "Pending KYC", value: stats?.pendingKyc ?? 0, icon: ShieldCheck, color: "bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400", nav: "/admin/kyc", trend: "Needs review", up: false, alert: true },
    { label: "Total Deposits", value: formatCurrency(stats?.totalBalance || 0), icon: DollarSign, color: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400", nav: "/admin/accounts", trend: "+5%", up: true },
    { label: "Pending Cards", value: "View", icon: CreditCard, color: "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400", nav: "/admin/cards", trend: "Needs review", up: false, alert: true },
  ];

  const actionCards = [
    { label: "Review Transactions", desc: "Approve or reject pending transfers", icon: Receipt, color: "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400", nav: "/admin/transactions" },
    { label: "Review KYC", desc: "Verify user identity documents", icon: UserCheck, color: "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400", nav: "/admin/kyc" },
    { label: "Manage Users", desc: "View and manage user accounts", icon: Users, color: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400", nav: "/admin/users" },
    { label: "Manage Accounts", desc: "Credit, debit and control balances", icon: Landmark, color: "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400", nav: "/admin/accounts" },
    { label: "Manage Cards", desc: "Approve or reject card requests", icon: CreditCard, color: "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400", nav: "/admin/cards" },
  ];

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6 dark:bg-slate-700" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-32 dark:bg-slate-700" />)}</div></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Overview of the banking system</p></div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border shadow-sm hover:shadow-md transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800" onClick={() => navigate(stat.nav)}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}><Icon className="w-5 h-5" /></div>
                  <div className="flex items-center gap-1">
                    {stat.alert && <AlertCircle className="w-3.5 h-3.5 text-amber-500" />}
                    <span className={`text-xs font-medium ${stat.alert ? "text-amber-600 dark:text-amber-400" : stat.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>{stat.trend}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{isLoading ? <Skeleton className="h-8 w-20 dark:bg-slate-700" /> : stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {actionCards.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.label} className="border shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700 transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800" onClick={() => navigate(action.nav)}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0`}><Icon className="w-6 h-6" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{action.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{action.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
