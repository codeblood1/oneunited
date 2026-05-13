import { useAuth } from "@/hooks/useAuth";
import { useAdminCards } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CreditCard, CheckCircle2, XCircle, Loader2, Clock,
  Wifi, Eye, EyeOff, Copy, Check,
} from "lucide-react";

export default function AdminCards() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const { cardRequests, isLoading, fetchCardRequests, approveCard, rejectCard } = useAdminCards();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showCvv, setShowCvv] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);
  useEffect(() => { fetchCardRequests(statusFilter); }, [statusFilter, fetchCardRequests]);

  const toggleCvv = (id: number) => setShowCvv((p) => ({ ...p, [id]: !p[id] }));
  const copyNumber = (num: string, id: number) => { navigator.clipboard.writeText(num.replace(/\s/g, "")); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  const handleApprove = async (cardId: number) => {
    if (!confirm("Approve this card request and generate card details?")) return;
    setProcessingId(cardId);
    try {
      await approveCard(cardId);
      toast.success("Card approved and generated");
      fetchCardRequests(statusFilter);
    } catch (err: any) { toast.error(err.message || "Failed to approve"); }
    setProcessingId(null);
  };

  const handleReject = async (cardId: number) => {
    if (!confirm("Reject this card request?")) return;
    setProcessingId(cardId);
    try {
      await rejectCard(cardId);
      toast.success("Card rejected");
      fetchCardRequests(statusFilter);
    } catch (err: any) { toast.error(err.message || "Failed to reject"); }
    setProcessingId(null);
  };

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6 dark:bg-slate-700" /><Skeleton className="h-96 dark:bg-slate-700" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Card Requests</h1><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review and approve debit card requests</p></div>

      <div className="flex gap-1">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? [1,2,3,4].map((i) => <Skeleton key={i} className="h-64 dark:bg-slate-700" />) :
         cardRequests.length > 0 ? cardRequests.map((card) => (
          <Card key={card.id} className="border shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center"><CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.card_type === "visa_debit" ? "Visa Debit" : card.card_type === "mastercard_debit" ? "Mastercard Debit" : "Virtual Card"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">User #{card.user_id} · {new Date(card.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  card.status === "approved" ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                  card.status === "pending" ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" :
                  "bg-rose-50 dark:bg-rose-500/20 text-rose-500"
                }`}>{card.status}</span>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-medium">Cardholder:</span> {card.cardholder_name}</p>

              {/* Show generated card details for approved cards */}
              {card.status === "approved" && card.card_number && (
                <div className={`relative overflow-hidden rounded-xl p-4 ${
                  card.card_type === "visa_debit" ? "bg-gradient-to-br from-blue-600 to-indigo-800" :
                  card.card_type === "mastercard_debit" ? "bg-gradient-to-br from-amber-500 to-red-700" :
                  "bg-gradient-to-br from-emerald-500 to-cyan-700"
                } text-white space-y-3`}>
                  <div className="flex items-center justify-between">
                    <Wifi className="w-5 h-5 text-white/70 rotate-90" />
                    <span className="text-sm font-bold italic">{card.card_type === "visa_debit" ? "VISA" : card.card_type === "mastercard_debit" ? "mastercard" : "VIRTUAL"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono tracking-wider">{card.card_number}</p>
                    <button onClick={() => copyNumber(card.card_number!, card.id)}
                      className="p-1 rounded hover:bg-white/20 text-white/70 hover:text-white">
                      {copiedId === card.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div><span className="text-white/60">Expires</span> <span className="font-medium ml-1">{card.expiry_date}</span></div>
                    <div className="flex items-center gap-1">
                      <span className="text-white/60">CVV</span>
                      <button onClick={() => toggleCvv(card.id)} className="hover:text-white/80 transition-colors">
                        <span className="font-medium ml-1">{showCvv[card.id] ? card.cvv : "***"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {card.admin_note && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Admin Note:</p>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">{card.admin_note}</p>
                </div>
              )}

              {card.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(card.id)} disabled={processingId === card.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-full py-2 flex items-center justify-center gap-2 text-sm font-medium transition-all">
                    {processingId === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}Approve
                  </button>
                  <button onClick={() => handleReject(card.id)} disabled={processingId === card.id}
                    className="flex-1 border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full py-2 flex items-center justify-center gap-2 text-sm font-medium transition-all">
                    {processingId === card.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Reject
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-2 text-center py-12">
            <CreditCard className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No card requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}
