import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeftRight, Send, Wallet, Loader2 } from "lucide-react";

export default function Transfer() {
  const utils = trpc.useUtils();
  const { data: accounts, isLoading } = trpc.account.list.useQuery();
  const transferMutation = trpc.transaction.transfer.useMutation({
    onSuccess: () => { utils.transaction.list.invalidate(); utils.account.list.invalidate(); toast.success("Transfer submitted"); setFromAccount(""); setToAccount(""); setAmount(""); setDescription(""); },
    onError: (err) => toast.error(err.message),
  });

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const selectedAccount = accounts?.find((a) => a.id.toString() === fromAccount);
  const availableBalance = selectedAccount ? parseFloat(selectedAccount.balance as string) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !amount) { toast.error("Fill in all required fields"); return; }
    if (toAccount.length < 4) { toast.error("Enter a valid account number"); return; }
    transferMutation.mutate({ fromAccountId: parseInt(fromAccount), toAccountNumber: toAccount, amount, description: description || undefined });
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Send Money</h1>
        <p className="text-slate-500 text-sm mt-1">Transfer funds to another account</p>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2"><ArrowLeftRight className="w-4 h-4 text-[#fbbf24]" />Transfer Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4"><div className="h-12 bg-slate-100 rounded-xl animate-pulse" /><div className="h-12 bg-slate-100 rounded-xl animate-pulse" /><div className="h-12 bg-slate-100 rounded-xl animate-pulse" /></div>
          ) : accounts && accounts.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">From Account</label>
                <select value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-amber-300 appearance-none cursor-pointer shadow-sm">
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>{account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} - {account.accountNumber} ({formatCurrency(parseFloat(account.balance as string))})</option>
                  ))}
                </select>
                {selectedAccount && <p className="text-xs text-slate-500 mt-1.5">Available: <span className="text-slate-900 font-medium">{formatCurrency(availableBalance)}</span></p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">To Account Number</label>
                <input type="text" value={toAccount} onChange={(e) => setToAccount(e.target.value.toUpperCase())} placeholder="Enter recipient account number"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input type="text" value={amount} onChange={(e) => { const val = e.target.value; if (/^\d*\.?\d{0,2}$/.test(val)) setAmount(val); }} placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description (optional)</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this for?"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" />
              </div>
              <Button type="submit" disabled={transferMutation.isPending || !fromAccount || !toAccount || !amount}
                className="w-full bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full py-6 shadow-md shadow-amber-400/20">
                {transferMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {transferMutation.isPending ? "Processing..." : "Send Money"}
              </Button>
              <p className="text-xs text-center text-slate-500">Transfers require admin approval for security.</p>
            </form>
          ) : (
            <div className="text-center py-8"><Wallet className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500">Open an account first to make transfers.</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
