import { useAuth } from "@/hooks/useAuth";
import { useAdminAccounts } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Landmark, Wallet, PiggyBank, DollarSign, Building2, Globe,
  Loader2, Plus, Minus, Power, PowerOff, ArrowLeftRight,
  ShieldCheck, Users, Receipt, UserCheck,
} from "lucide-react";

export default function AdminAccounts() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { accounts, isLoading, fetchAccounts, updateBalance, toggleAccount } = useAdminAccounts();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);
  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const totalBalance = accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance as string) || 0), 0);
  const checkingCount = accounts.filter((a) => a.account_type === "checking").length;
  const savingsCount = accounts.filter((a) => a.account_type === "savings").length;

  const handleCredit = async (accountId: number) => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setProcessingId(accountId);
    try {
      await updateBalance(accountId, amt, "credit");
      toast.success(`Credited ${formatCurrency(amt)}`);
      setAmount(""); setEditingId(null);
      fetchAccounts();
    } catch (err: any) { toast.error(err.message || "Failed to credit"); }
    setProcessingId(null);
  };

  const handleDebit = async (accountId: number) => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    setProcessingId(accountId);
    try {
      await updateBalance(accountId, amt, "debit");
      toast.success(`Debited ${formatCurrency(amt)}`);
      setAmount(""); setEditingId(null);
      fetchAccounts();
    } catch (err: any) { toast.error(err.message || "Failed to debit"); }
    setProcessingId(null);
  };

  const handleToggle = async (accountId: number, isActive: boolean) => {
    setProcessingId(accountId);
    try {
      await toggleAccount(accountId, isActive);
      toast.success(`Account ${isActive ? "deactivated" : "activated"}`);
      fetchAccounts();
    } catch (err: any) { toast.error(err.message || "Failed to toggle"); }
    setProcessingId(null);
  };

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6 dark:bg-slate-700" /><Skeleton className="h-96 dark:bg-slate-700" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accounts</h1><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage all bank accounts and balances</p></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm dark:border-slate-700 dark:bg-slate-800"><CardContent className="p-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center"><DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
            <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalBalance)}</p><p className="text-xs text-slate-500 dark:text-slate-400">Total Deposits</p></div>
          </div></CardContent></Card>
        <Card className="border shadow-sm dark:border-slate-700 dark:bg-slate-800"><CardContent className="p-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center"><Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
            <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{checkingCount}</p><p className="text-xs text-slate-500 dark:text-slate-400">Checking Accounts</p></div>
          </div></CardContent></Card>
        <Card className="border shadow-sm dark:border-slate-700 dark:bg-slate-800"><CardContent className="p-4">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center"><PiggyBank className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
            <div><p className="text-2xl font-bold text-slate-900 dark:text-white">{savingsCount}</p><p className="text-xs text-slate-500 dark:text-slate-400">Savings Accounts</p></div>
          </div></CardContent></Card>
      </div>

      {/* Accounts Table */}
      <Card className="border shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <CardHeader className="pb-3"><CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Wallet className="w-4 h-4 text-[#fbbf24]" />All Accounts</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Account</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Balance</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Bank</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {isLoading ? [1,2,3,4,5].map((i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-10 w-full dark:bg-slate-700" /></td></tr>) :
                 accounts.length > 0 ? accounts.map((account) => (
                  <tr key={account.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {account.account_type === "checking" ? <Landmark className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <PiggyBank className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        <div>
                          <p className="text-sm font-mono text-slate-900 dark:text-white">{account.account_number}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{account.account_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{account.user_id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(parseFloat(account.balance as string) || 0)}</p>
                      <p className="text-xs text-slate-400">{account.currency}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-slate-900 dark:text-white">{account.bank_name || "OneUnited"}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Globe className="w-3 h-3" />{account.bank_country || "US"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${account.is_active ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/20 text-rose-500"}`}>{account.is_active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === account.id ? (
                        <div className="flex flex-col gap-2 min-w-[160px]">
                          <input type="text" value={amount} onChange={(e) => { const v = e.target.value; if (/^\d*\.?\d{0,2}$/.test(v)) setAmount(v); }} placeholder="0.00"
                            className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm" />
                          <div className="flex gap-1">
                            <button onClick={() => handleCredit(account.id)} disabled={processingId === account.id}
                              className="flex-1 px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center gap-1"><Plus className="w-3 h-3" />Credit</button>
                            <button onClick={() => handleDebit(account.id)} disabled={processingId === account.id}
                              className="flex-1 px-2 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center gap-1"><Minus className="w-3 h-3" />Debit</button>
                          </div>
                          <button onClick={() => { setEditingId(null); setAmount(""); }} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingId(account.id); setAmount(""); }} disabled={processingId === account.id}
                            className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/20 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors" title="Edit balance">
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleToggle(account.id, account.is_active)} disabled={processingId === account.id}
                            className={`p-1.5 rounded-lg transition-colors ${account.is_active ? "hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500" : "hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-600"}`} title={account.is_active ? "Deactivate" : "Activate"}>
                            {account.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"><Landmark className="w-8 h-8 mx-auto mb-2" /><p>No accounts found</p></td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
