import { useAccounts, useTransactions, BANKS, COUNTRIES } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { Wallet, Plus, Copy, Check, Landmark, PiggyBank, Globe, Building2, X } from "lucide-react";

export default function Accounts() {
  const { accounts, isLoading, createAccount } = useAccounts();
  const { refresh: refreshTx } = useTransactions();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState("oneunited");
  const [creatingType, setCreatingType] = useState<"checking" | "savings" | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const copyToClipboard = (text: string, id: number) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  const hasChecking = accounts.some((a) => a.account_type === "checking");
  const hasSavings = accounts.some((a) => a.account_type === "savings");

  const handleCreate = async (type: "checking" | "savings") => {
    setCreatingType(type);
    const result = await createAccount(type, selectedBank);
    if (result.success) { toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} account created`); setOpenDialog(false); refreshTx(); }
    else { toast.error(result.error || "Failed to create account"); }
    setCreatingType(null);
  };

  const selectedBankInfo = BANKS.find(b => b.id === selectedBank);
  const selectedCountry = selectedBankInfo ? COUNTRIES.find(c => c.code === selectedBankInfo.country) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accounts</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your bank accounts</p>
        </div>
        <button onClick={() => setOpenDialog(true)}
          className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full px-5 py-2.5 shadow-md shadow-amber-400/20 flex items-center gap-2 text-sm transition-all">
          <Plus className="w-4 h-4" />Open Account
        </button>
      </div>

      {/* Open Account Dialog */}
      {openDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setOpenDialog(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5 border border-slate-200 dark:border-slate-600" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Open New Account</h2>
              <button onClick={() => setOpenDialog(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bank Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Bank</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-300 appearance-none cursor-pointer shadow-sm">
                  {BANKS.map(bank => (
                    <option key={bank.id} value={bank.id}>{bank.name} ({bank.swift})</option>
                  ))}
                </select>
              </div>
              {selectedCountry && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Globe className="w-4 h-4" />
                  <span>{selectedCountry.name}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span>{selectedCountry.currency}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              {!hasChecking && (
                <button onClick={() => handleCreate("checking")} disabled={creatingType !== null}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all text-left group disabled:opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Landmark className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Checking Account</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">For daily spending and transactions</p>
                    </div>
                    {creatingType === "checking" && <div className="ml-auto w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />}
                  </div>
                </button>
              )}
              {!hasSavings && (
                <button onClick={() => handleCreate("savings")} disabled={creatingType !== null}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all text-left group disabled:opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PiggyBank className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Savings Account</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Earn interest on your savings</p>
                    </div>
                    {creatingType === "savings" && <div className="ml-auto w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
                  </div>
                </button>
              )}
              {hasChecking && hasSavings && <p className="text-center text-slate-500 dark:text-slate-400 py-4">You have all available account types.</p>}
            </div>
          </div>
        </div>
      )}

      {/* Accounts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="border shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow dark:border-slate-700">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 dark:bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {account.account_type === "checking" ? <Landmark className="w-5 h-5 text-[#fbbf24]" /> : <PiggyBank className="w-5 h-5 text-emerald-600" />}
                    <CardTitle className="text-base font-semibold capitalize text-slate-900 dark:text-white">{account.account_type}</CardTitle>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${account.is_active ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/20 text-rose-500"}`}>
                    {account.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {formatCurrency(typeof account.balance === "string" ? parseFloat(account.balance) : account.balance || 0)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Available Balance</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Account Number</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-slate-900 dark:text-white tracking-wider">{account.account_number}</p>
                    <button onClick={() => copyToClipboard(account.account_number, account.id)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 transition-colors">
                      {copiedId === account.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3.5 h-3.5" /><span>{account.bank_name || "OneUnited Bank"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /><span>{account.bank_country || "US"}</span></div>
                    <span>Currency: {account.currency}</span>
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">SWIFT: {account.swift_code || "OUNUUS33"}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border shadow-sm dark:border-slate-700">
          <CardContent className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">No accounts yet</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Open your first account to start banking.</p>
            <button onClick={() => setOpenDialog(true)}
              className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full px-5 py-2.5 shadow-md shadow-amber-400/20 inline-flex items-center gap-2 text-sm transition-all">
              <Plus className="w-4 h-4" />Open Account
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
