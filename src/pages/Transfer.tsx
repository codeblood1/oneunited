import { useAccounts, useTransactions, BANKS, COUNTRIES } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeftRight, Send, Wallet, Loader2, Building2, Globe, User, Landmark } from "lucide-react";

export default function Transfer() {
  const { accounts, isLoading } = useAccounts();
  const { createTransfer } = useTransactions();
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [selectedBank, setSelectedBank] = useState("oneunited");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAccount = accounts.find((a) => a.id.toString() === fromAccount);
  const availableBalance = selectedAccount ? (typeof selectedAccount.balance === "string" ? parseFloat(selectedAccount.balance) : selectedAccount.balance || 0) : 0;
  const bankInfo = BANKS.find(b => b.id === selectedBank);
  const countryInfo = bankInfo ? COUNTRIES.find(c => c.code === bankInfo.country) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !amount) { toast.error("Fill in all required fields"); return; }
    if (toAccount.length < 4) { toast.error("Enter a valid account number"); return; }
    if (parseFloat(amount) > availableBalance) { toast.error("Insufficient balance"); return; }

    setIsSubmitting(true);
    const result = await createTransfer({
      fromAccountId: parseInt(fromAccount),
      toAccountNumber: toAccount,
      amount,
      description,
      recipientBankId: selectedBank,
      recipientBankName: bankInfo?.name,
      recipientBankCountry: bankInfo?.country,
      recipientSwift: bankInfo?.swift,
      recipientName: recipientName || undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Transfer submitted for approval");
      setFromAccount(""); setToAccount(""); setAmount(""); setDescription(""); setRecipientName(""); setSelectedBank("oneunited");
    } else {
      toast.error(result.error || "Transfer failed");
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Send Money</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Transfer funds to any account worldwide</p>
      </div>

      <Card className="border shadow-sm dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-[#fbbf24]" />Transfer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
            </div>
          ) : accounts.length > 0 ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* From Account */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">From Account</label>
                <select value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-300 appearance-none cursor-pointer shadow-sm">
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} - {account.account_number} ({formatCurrency(typeof account.balance === "string" ? parseFloat(account.balance) : account.balance || 0)})
                    </option>
                  ))}
                </select>
                {selectedAccount && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                    Available: <span className="text-slate-900 dark:text-white font-medium">{formatCurrency(availableBalance)}</span>
                    {selectedAccount.bank_name && <span className="ml-2 text-slate-400">· {selectedAccount.bank_name}</span>}
                  </p>
                )}
              </div>

              {/* Recipient Bank */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recipient Bank</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-300 appearance-none cursor-pointer shadow-sm">
                    {BANKS.map(bank => <option key={bank.id} value={bank.id}>{bank.name} ({bank.swift})</option>)}
                  </select>
                </div>
                {countryInfo && (
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{countryInfo.name}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>{countryInfo.currency}</span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span>SWIFT: {bankInfo?.swift}</span>
                  </div>
                )}
              </div>

              {/* Recipient Account */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recipient Account Number</label>
                <input type="text" value={toAccount} onChange={(e) => setToAccount(e.target.value.toUpperCase())} placeholder="Enter recipient account number" required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" />
              </div>

              {/* Recipient Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Recipient Name (optional)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Full name of recipient"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input type="text" value={amount} onChange={(e) => { const val = e.target.value; if (/^\d*\.?\d{0,2}$/.test(val)) setAmount(val); }} placeholder="0.00" required
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description (optional)</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this for?"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" />
              </div>

              <button type="submit" disabled={isSubmitting || !fromAccount || !toAccount || !amount}
                className="w-full bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full py-3.5 shadow-md shadow-amber-400/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {isSubmitting ? "Processing..." : "Send Money"}
              </button>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">Transfers require admin approval for security.</p>
            </form>
          ) : (
            <div className="text-center py-8">
              <Wallet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Open an account first to make transfers.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
