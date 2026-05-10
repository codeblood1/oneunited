import { useAuth } from "@/hooks/useAuth";
import { useAdminStats } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import {
  Users, Wallet, Receipt, Clock, ShieldCheck, DollarSign,
  ArrowUpRight, ArrowDownRight, BarChart3, UserCheck, Landmark,
} from "lucide-react";

export default function AdminDashboard() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading } = useAdminStats();

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400", trend: "+12%", up: true },
    { label: "Total Accounts", value: stats?.totalAccounts ?? 0, icon: Wallet, color: "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400", trend: "+8%", up: true },
    { label: "Total Transactions", value: stats?.totalTransactions ?? 0, icon: Receipt, color: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400", trend: "+24%", up: true },
    { label: "Pending Transactions", value: stats?.pendingTransactions ?? 0, icon: Clock, color: "bg-amber-50 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400", trend: "Needs review", up: false, alert: true },
    { label: "Pending KYC", value: stats?.pendingKyc ?? 0, icon: ShieldCheck, color: "bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400", trend: "Needs review", up: false, alert: true },
    { label: "Total Deposits", value: formatCurrency(stats?.totalBalance || 0), icon: DollarSign, color: "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400", trend: "+5%", up: true },
  ];

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6 dark:bg-slate-700" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-32 dark:bg-slate-700" />)}</div></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Overview of the banking system</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer dark:border-slate-700 dark:bg-slate-800" onClick={() => { if (stat.label.includes("Pending")) navigate("/admin/transactions"); if (stat.label === "Pending KYC") navigate("/admin/kyc"); if (stat.label === "Total Users") navigate("/admin/users"); if (stat.label === "Total Accounts") navigate("/admin/accounts"); }}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}><Icon className="w-5 h-5" /></div>
                  {stat.trend && <div className={`flex items-center gap-1 text-xs font-medium ${stat.alert ? "text-amber-600 dark:text-amber-400" : stat.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}>{stat.up && !stat.alert ? <ArrowUpRight className="w-3 h-3" /> : !stat.alert ? <ArrowDownRight className="w-3 h-3" /> : null}{stat.trend}</div>}
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{isLoading ? <Skeleton className="h-8 w-20 dark:bg-slate-700" /> : stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800" onClick={() => navigate("/admin/transactions")}>
          <CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center"><Receipt className="w-6 h-6 text-amber-600 dark:text-amber-400" /></div><div><p className="font-semibold text-slate-900 dark:text-white">Review Transactions</p><p className="text-xs text-slate-500 dark:text-slate-400">Approve or reject pending transfers</p></div></CardContent>
        </Card>
        <Card className="border shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800" onClick={() => navigate("/admin/kyc")}>
          <CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center"><UserCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /></div><div><p className="font-semibold text-slate-900 dark:text-white">Review KYC</p><p className="text-xs text-slate-500 dark:text-slate-400">Verify user identities</p></div></CardContent>
        </Card>
        <Card className="border shadow-sm hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer dark:border-slate-700 dark:bg-slate-800" onClick={() => navigate("/admin/users")}>
          <CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center"><Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /></div><div><p className="font-semibold text-slate-900 dark:text-white">Manage Users</p><p className="text-xs text-slate-500 dark:text-slate-400">View and manage user accounts</p></div></CardContent>
        </Card>
      </div>
    </div>
  );
}
