import { useTransactions } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Receipt, Clock,
} from "lucide-react";

export default function Transactions() {
  const { transactions, isLoading } = useTransactions();

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400";
      case "approved": return "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "pending": return "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400";
      case "rejected": return "bg-rose-50 dark:bg-rose-500/20 text-rose-500";
      default: return "bg-slate-50 dark:bg-slate-700 text-slate-500";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View all your banking activity</p>
      </div>

      <Card className="border shadow-sm dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#fbbf24]" />All Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-20" />)
          ) : transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 dark:bg-slate-800/30 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tx.type === "deposit" ? "bg-emerald-50 dark:bg-emerald-500/20" : tx.type === "withdrawal" ? "bg-rose-50 dark:bg-rose-500/20" : "bg-indigo-50 dark:bg-indigo-500/20"
                  }`}>
                    {tx.type === "deposit" ? <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                      : tx.type === "withdrawal" ? <ArrowUpRight className="w-5 h-5 text-rose-500" />
                      : <ArrowLeftRight className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{tx.description || tx.type}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatDate(tx.created_at)}</span>
                      {tx.recipient_bank_name && (
                        <><span className="text-slate-300 dark:text-slate-600">·</span><span>{tx.recipient_bank_name}</span></>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === "deposit" ? "text-emerald-600" : "text-rose-500"}`}>
                    {tx.type === "deposit" ? "+" : "-"}{formatCurrency(typeof tx.amount === "string" ? parseFloat(tx.amount) : tx.amount || 0)}
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">No transactions yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Your banking activity will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
