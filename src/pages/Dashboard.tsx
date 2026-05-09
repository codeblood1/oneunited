import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, Link } from "react-router";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Shield,
  ShieldCheck,
  Clock,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);

  const { data: accounts, isLoading: accountsLoading } = trpc.account.list.useQuery();
  const { data: transactions, isLoading: txLoading } = trpc.transaction.list.useQuery({ limit: 5 });

  const totalBalance = accounts?.reduce((sum, acc) => sum + parseFloat(acc.balance as string), 0) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.kycStatus === "verified" ? (
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Verified Account
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" />
                Verification {user?.kycStatus || "pending"}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate("/transfer")}
            className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full shadow-md shadow-amber-400/20"
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            Send Money
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#fbbf24]" />
              <span className="text-slate-500 text-sm">Total Balance</span>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-2">
            {accountsLoading ? (
              <Skeleton className="h-10 w-48" />
            ) : showBalance ? (
              formatCurrency(totalBalance)
            ) : (
              "****"
            )}
          </div>
          <div className="flex items-center gap-1 text-emerald-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+2.4% this month</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Deposit", icon: ArrowDownLeft, action: () => navigate("/accounts"), color: "bg-emerald-50 text-emerald-600", hoverColor: "hover:bg-emerald-100" },
          { label: "Withdraw", icon: ArrowUpRight, action: () => navigate("/accounts"), color: "bg-rose-50 text-rose-600", hoverColor: "hover:bg-rose-100" },
          { label: "Transfer", icon: ArrowLeftRight, action: () => navigate("/transfer"), color: "bg-indigo-50 text-indigo-600", hoverColor: "hover:bg-indigo-100" },
          { label: "Verify", icon: ShieldCheck, action: () => navigate("/verification"), color: "bg-amber-50 text-amber-600", hoverColor: "hover:bg-amber-100" },
        ].map((action) => (
          <button
            key={action.label}
            onClick={action.action}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-200 ${action.hoverColor} hover:-translate-y-0.5 transition-all group shadow-sm`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${action.color}`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Accounts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">Your Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {accountsLoading ? (
              [1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)
            ) : accounts && accounts.length > 0 ? (
              accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-100"
                  onClick={() => navigate("/accounts")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-[#fbbf24]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 capitalize">{account.accountType}</p>
                      <p className="text-xs text-slate-500">{account.accountNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(parseFloat(account.balance as string))}
                    </p>
                    <p className="text-xs text-emerald-600">{account.currency}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500 text-sm">No accounts yet</p>
                <Button
                  onClick={() => navigate("/accounts")}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-amber-200 text-amber-700 hover:bg-amber-50"
                >
                  Open Account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-900">Recent Activity</CardTitle>
            <Link to="/transactions" className="text-xs text-amber-600 hover:underline font-medium">View All</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {txLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)
            ) : transactions && transactions.length > 0 ? (
              transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      tx.type === "deposit" ? "bg-emerald-50" : tx.type === "withdrawal" ? "bg-rose-50" : "bg-indigo-50"
                    }`}>
                      {tx.type === "deposit" ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      ) : tx.type === "withdrawal" ? (
                        <ArrowUpRight className="w-4 h-4 text-rose-500" />
                      ) : (
                        <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 capitalize">{tx.description || tx.type}</p>
                      <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${tx.type === "deposit" ? "text-emerald-600" : "text-rose-500"}`}>
                      {tx.type === "deposit" ? "+" : "-"}{formatCurrency(parseFloat(tx.amount as string))}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{tx.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
