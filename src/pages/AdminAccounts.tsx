import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Landmark, Wallet, PiggyBank, DollarSign } from "lucide-react";

export default function AdminAccounts() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: accounts, isLoading } = trpc.admin.listAccounts.useQuery({ limit: 100 }, { enabled: isAdmin });

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance as string), 0) || 0;
  const checkingCount = accounts?.filter((a) => a.accountType === "checking").length || 0;
  const savingsCount = accounts?.filter((a) => a.accountType === "savings").length || 0;

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Accounts</h1><p className="text-slate-500 text-sm mt-1">View all bank accounts</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-200 shadow-sm"><CardContent className="p-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><DollarSign className="w-5 h-5 text-amber-600" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{formatCurrency(totalBalance)}</p><p className="text-xs text-slate-500">Total Deposits</p></div>
          </div></CardContent></Card>
        <Card className="bg-white border border-slate-200 shadow-sm"><CardContent className="p-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center"><Landmark className="w-5 h-5 text-indigo-600" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{checkingCount}</p><p className="text-xs text-slate-500">Checking Accounts</p></div>
          </div></CardContent></Card>
        <Card className="bg-white border border-slate-200 shadow-sm"><CardContent className="p-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><PiggyBank className="w-5 h-5 text-emerald-600" /></div>
            <div><p className="text-2xl font-bold text-slate-900">{savingsCount}</p><p className="text-xs text-slate-500">Savings Accounts</p></div>
          </div></CardContent></Card>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2"><Wallet className="w-4 h-4 text-[#fbbf24]" />All Accounts</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Account Number</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">User ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Balance</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Created</th>
              </tr></thead>
              <tbody>
                {isLoading ? [1,2,3,4,5].map((i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-10 w-full" /></td></tr>) :
                 accounts && accounts.length > 0 ? accounts.map((account) => (
                  <tr key={account.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3"><p className="text-sm font-mono text-slate-900">{account.accountNumber}</p></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2">{account.accountType === "checking" ? <Landmark className="w-4 h-4 text-amber-600" /> : <PiggyBank className="w-4 h-4 text-emerald-600" />}<span className="text-sm text-slate-900 capitalize">{account.accountType}</span></div></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{account.userId}</td>
                    <td className="px-4 py-3"><p className="text-sm font-semibold text-slate-900">{formatCurrency(parseFloat(account.balance as string))}</p></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${account.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>{account.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(account.createdAt)}</td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500"><Landmark className="w-8 h-8 mx-auto mb-2" /><p>No accounts found</p></td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
