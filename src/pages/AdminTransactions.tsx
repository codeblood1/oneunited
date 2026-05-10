import { useAuth } from "@/hooks/useAuth";
import { useAdminTransactions } from "@/hooks/useSupabaseData";
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
  const { transactions, isLoading, fetchTransactions, updateStatus } = useAdminTransactions();
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);
  useEffect(() => { fetchTransactions(statusFilter); }, [statusFilter, fetchTransactions]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const handleApprove = async (txId: number) => {
    if (!confirm("Approve this transaction?")) return;
    setProcessingId(txId);
    try {
      await updateStatus(txId, "approved");
      toast.success("Transaction approved");
      fetchTransactions(statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (txId: number) => {
    if (!confirm("Reject this transaction?")) return;
    setProcessingId(txId);
    try {
      await updateStatus(txId, "rejected");
      toast.success("Transaction rejected");
      fetchTransactions(statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6 dark:bg-slate-700" /><Skeleton className="h-96 dark:bg-slate-700" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and manage all transactions</p></div>

      <div className="flex gap-1 flex-wrap">
        {["all", "pending", "approved", "rejected", "completed"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      <Card className="border shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Receipt className="w-4 h-4 text-[#fbbf24]" />All Transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {isLoading ? [1,2,3,4,5].map((i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-10 w-full dark:bg-slate-700" /></td></tr>) :
                 transactions.length > 0 ? transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "deposit" ? "bg-emerald-50 dark:bg-emerald-500/20" : tx.type === "withdrawal" ? "bg-rose-50 dark:bg-rose-500/20" : "bg-indigo-50 dark:bg-indigo-500/20"}`}>
                        {tx.type === "deposit" ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> : tx.type === "withdrawal" ? <ArrowUpRight className="w-4 h-4 text-rose-500" /> : <ArrowLeftRight className="w-4 h-4 text-indigo-600" />}
                      </div><span className="text-sm text-slate-900 dark:text-white capitalize">{tx.type}</span>
                    </div></td>
                    <td className="px-4 py-3"><p className="text-sm text-slate-900 dark:text-white">{tx.description || tx.type}</p>{tx.recipient_bank_name && <p className="text-xs text-slate-500 dark:text-slate-400">To: {tx.recipient_bank_name}</p>}</td>
                    <td className="px-4 py-3"><p className={`text-sm font-semibold ${tx.type === "deposit" ? "text-emerald-600" : "text-rose-500"}`}>{tx.type === "deposit" ? "+" : "-"}{formatCurrency(typeof tx.amount === "string" ? parseFloat(tx.amount) : tx.amount || 0)}</p></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${tx.status === "completed" ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : tx.status === "pending" ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" : "bg-rose-50 dark:bg-rose-500/20 text-rose-500"}`}>{tx.status}</span></td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">{formatDate(tx.created_at)}</td>
                    <td className="px-4 py-3">
                      {tx.status === "pending" && <div className="flex items-center gap-1">
                        <button onClick={() => handleApprove(tx.id)} disabled={processingId === tx.id} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-600 transition-colors" title="Approve">{processingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}</button>
                        <button onClick={() => handleReject(tx.id)} disabled={processingId === tx.id} className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors" title="Reject">{processingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}</button>
                      </div>}
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"><Receipt className="w-8 h-8 mx-auto mb-2" /><p>No transactions found</p></td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
