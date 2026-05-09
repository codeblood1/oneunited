import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { Wallet, Plus, Copy, Check, Landmark, PiggyBank } from "lucide-react";

export default function Accounts() {
  const utils = trpc.useUtils();
  const { data: accounts, isLoading } = trpc.account.list.useQuery();
  const createMutation = trpc.account.create.useMutation({
    onSuccess: () => { utils.account.list.invalidate(); toast.success("Account created"); setOpenDialog(false); },
    onError: (err) => toast.error(err.message),
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hasChecking = accounts?.some((a) => a.accountType === "checking");
  const hasSavings = accounts?.some((a) => a.accountType === "savings");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your bank accounts</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full shadow-md shadow-amber-400/20">
              <Plus className="w-4 h-4 mr-2" />Open Account
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-slate-200 text-slate-900">
            <DialogHeader><DialogTitle>Open New Account</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              {!hasChecking && (
                <button onClick={() => createMutation.mutate({ accountType: "checking" })} disabled={createMutation.isPending}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all text-left group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Landmark className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Checking Account</p>
                      <p className="text-sm text-slate-500">For daily spending and transactions</p>
                    </div>
                  </div>
                </button>
              )}
              {!hasSavings && (
                <button onClick={() => createMutation.mutate({ accountType: "savings" })} disabled={createMutation.isPending}
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left group">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <PiggyBank className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Savings Account</p>
                      <p className="text-sm text-slate-500">Earn interest on your savings</p>
                    </div>
                  </div>
                </button>
              )}
              {hasChecking && hasSavings && <p className="text-center text-slate-500 py-4">You have all available account types.</p>}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <Skeleton key={i} className="h-48" />)}</div>
      ) : accounts && accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="bg-white border border-slate-200 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {account.accountType === "checking" ? <Landmark className="w-5 h-5 text-[#fbbf24]" /> : <PiggyBank className="w-5 h-5 text-emerald-600" />}
                    <CardTitle className="text-base font-semibold capitalize text-slate-900">{account.accountType}</CardTitle>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${account.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>{account.isActive ? "Active" : "Inactive"}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{formatCurrency(parseFloat(account.balance as string))}</p>
                  <p className="text-xs text-slate-500 mt-1">Available Balance</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500 mb-1">Account Number</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-slate-900 tracking-wider">{account.accountNumber}</p>
                    <button onClick={() => copyToClipboard(account.accountNumber, account.id)} className="p-1 rounded hover:bg-slate-200 text-slate-400 transition-colors">
                      {copiedId === account.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Currency: {account.currency}</span>
                  <span>Opened: {new Date(account.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-900 mb-2">No accounts yet</p>
            <p className="text-slate-500 text-sm mb-4">Open your first account to start banking.</p>
            <Button onClick={() => setOpenDialog(true)} className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full shadow-md shadow-amber-400/20">
              <Plus className="w-4 h-4 mr-2" />Open Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
