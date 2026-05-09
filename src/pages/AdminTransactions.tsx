import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Receipt, CheckCircle2, XCircle, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Loader2 } from "lucide-react";

export default function AdminTransactions() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const { data: transactions, isLoading, refetch } = trpc.admin.listTransactions.useQuery({ status: (statusFilter as "pending" | "approved" | "rejected" | "completed") || undefined, limit: 100 }, { enabled: isAdmin });
  const approveMutation = trpc.admin.updateTransaction.useMutation({ onSuccess: () => { refetch(); toast.success("Transaction approved"); }, onError: (err) => toast.error(err.message) });
  const rejectMutation = trpc.admin.rejectTransaction.useMutation({ onSuccess: () => { refetch(); toast.success("Transaction rejected"); }, onError: (err) => toast.error(err.message) });

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Transactions</h1><p className="text-slate-500 text-sm mt-1">Review and manage all transactions</p></div>

      <div className="flex gap-1">
        {["all", "pending", "approved", "rejected", "completed"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-[#fbbf24]" />All Transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {isLoading ? [1,2,3,4,5].map((i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-10 w-full" /></td></tr>) :
                 transactions && transactions.length > 0 ? transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "deposit" ? "bg-emerald-50" : tx.type === "withdrawal" ? "bg-rose-50" : "bg-indigo-50"}`}>
                        {tx.type === "deposit" ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> : tx.type === "withdrawal" ? <ArrowUpRight className="w-4 h-4 text-rose-500" /> : <ArrowLeftRight className="w-4 h-4 text-indigo-600" />}
                      </div><span className="text-sm text-slate-900 capitalize">{tx.type}</span>
                    </div></td>
                    <td className="px-4 py-3"><p className="text-sm text-slate-900">{tx.description || tx.type}</p><p className="text-xs text-slate-500">From: {tx.fromAccountId || "N/A"} To: {tx.toAccountId || "N/A"}</p></td>
                    <td className="px-4 py-3"><p className={`text-sm font-semibold ${tx.type === "deposit" ? "text-emerald-600" : "text-rose-500"}`}>{tx.type === "deposit" ? "+" : "-"}{formatCurrency(parseFloat(tx.amount as string))}</p></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${tx.status === "completed" ? "bg-emerald-50 text-emerald-600" : tx.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-500"}`}>{tx.status}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(tx.createdAt)}</td>
                    <td className="px-4 py-3">
                      {tx.status === "pending" && <div className="flex items-center gap-1">
                        <button onClick={() => { if (confirm("Approve?")) approveMutation.mutate({ transactionId: tx.id, status: "approved" }); }} disabled={approveMutation.isPending} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Approve">{approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}</button>
                        <button onClick={() => { if (confirm("Reject?")) rejectMutation.mutate({ transactionId: tx.id }); }} disabled={rejectMutation.isPending} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors" title="Reject">{rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}</button>
                      </div>}
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500"><Receipt className="w-8 h-8 mx-auto mb-2" /><p>No transactions found</p></td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
