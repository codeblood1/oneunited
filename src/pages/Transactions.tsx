import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Receipt, Filter, Search } from "lucide-react";

export default function Transactions() {
  const { data: transactions, isLoading } = trpc.transaction.list.useQuery({ limit: 100 });
  const { data: accounts } = trpc.account.list.useQuery();
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const getAccountNumber = (accountId: number | null) => { if (!accountId || !accounts) return ""; const acc = accounts.find((a) => a.id === accountId); return acc ? acc.accountNumber : ""; };

  const filteredTransactions = transactions?.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false;
    if (searchQuery) { const q = searchQuery.toLowerCase(); return (tx.description || "").toLowerCase().includes(q) || tx.type.toLowerCase().includes(q) || tx.status.toLowerCase().includes(q); }
    return true;
  });

  const filters = [{ label: "All", value: "all" }, { label: "Deposits", value: "deposit" }, { label: "Withdrawals", value: "withdrawal" }, { label: "Transfers", value: "transfer" }];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-500 text-sm mt-1">View your transaction history</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1">
            {filters.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${filter === f.value ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2"><Receipt className="w-4 h-4 text-[#fbbf24]" />All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "deposit" ? "bg-emerald-50" : tx.type === "withdrawal" ? "bg-rose-50" : "bg-indigo-50"}`}>
                      {tx.type === "deposit" ? <ArrowDownLeft className="w-5 h-5 text-emerald-600" /> : tx.type === "withdrawal" ? <ArrowUpRight className="w-5 h-5 text-rose-500" /> : <ArrowLeftRight className="w-5 h-5 text-indigo-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 capitalize">{tx.description || tx.type}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{formatDate(tx.createdAt)}</span>
                        {tx.fromAccountId && <span className="text-xs text-slate-400">From: {getAccountNumber(tx.fromAccountId)}</span>}
                        {tx.toAccountId && <span className="text-xs text-slate-400">To: {getAccountNumber(tx.toAccountId)}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === "deposit" ? "text-emerald-600" : "text-rose-500"}`}>{tx.type === "deposit" ? "+" : "-"}{formatCurrency(parseFloat(tx.amount as string))}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${tx.status === "completed" ? "bg-emerald-50 text-emerald-600" : tx.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-500"}`}>{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12"><Receipt className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500">No transactions found</p></div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
