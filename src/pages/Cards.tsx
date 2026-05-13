import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCardRequests, type CardType } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  CreditCard, ShieldCheck, Clock, XCircle, Eye, EyeOff,
  Landmark, Wifi, Loader2, CheckCircle2, AlertCircle, Copy, Check,
} from "lucide-react";

const CARD_TYPES: { id: CardType; label: string; description: string; color: string }[] = [
  { id: "visa_debit", label: "Visa Debit", description: "Standard debit card for everyday purchases", color: "from-blue-600 to-blue-800" },
  { id: "mastercard_debit", label: "Mastercard Debit", description: "Worldwide acceptance with premium benefits", color: "from-amber-600 to-amber-800" },
  { id: "virtual", label: "Virtual Card", description: "Digital-only card for online transactions", color: "from-emerald-600 to-emerald-800" },
];

export default function Cards() {
  const { user } = useAuth();
  const { cards, isLoading, requestCard } = useCardRequests();
  const [selectedType, setSelectedType] = useState<CardType>("visa_debit");
  const [cardholderName, setCardholderName] = useState(user?.name || "");
  const [busy, setBusy] = useState(false);
  const [showCvv, setShowCvv] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleRequest = async () => {
    if (!cardholderName.trim()) { toast.error("Enter cardholder name"); return; }
    setBusy(true);
    const result = await requestCard(selectedType, cardholderName.trim());
    if (result.success) {
      toast.success("Card request submitted for approval");
      setCardholderName(user?.name || "");
    } else {
      toast.error(result.error || "Request failed");
    }
    setBusy(false);
  };

  const toggleCvv = (id: number) => setShowCvv((p) => ({ ...p, [id]: !p[id] }));
  const copyNumber = (num: string, id: number) => { navigator.clipboard.writeText(num.replace(/\s/g, "")); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  const pendingCards = cards.filter((c) => c.status === "pending");
  const approvedCards = cards.filter((c) => c.status === "approved");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Cards</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Request and manage your debit cards</p>
      </div>

      {/* Approved Cards - Beautiful Card Visuals */}
      {approvedCards.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />Active Cards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedCards.map((card) => (
              <div key={card.id} className="relative overflow-hidden rounded-2xl shadow-lg">
                {/* Card background gradient */}
                <div className={`relative p-6 bg-gradient-to-br ${
                  card.card_type === "visa_debit" ? "from-blue-600 via-blue-700 to-indigo-800" :
                  card.card_type === "mastercard_debit" ? "from-amber-500 via-orange-600 to-red-700" :
                  "from-emerald-500 via-teal-600 to-cyan-700"
                } text-white`}>
                  {/* Decorative circles */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                  <div className="relative z-10 space-y-4">
                    {/* Top row: chip + wifi + logo */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-8 rounded bg-amber-200/90 flex items-center justify-center">
                          <div className="grid grid-cols-2 gap-px w-6 h-4">
                            {[...8].map((_, i) => (
                              <div key={i} className="bg-amber-700/30 rounded-sm" />
                            ))}
                          </div>
                        </div>
                        <Wifi className="w-5 h-5 text-white/70 rotate-90" />
                      </div>
                      <span className="text-lg font-bold italic tracking-wider">
                        {card.card_type === "visa_debit" ? "VISA" : card.card_type === "mastercard_debit" ? "mastercard" : "VIRTUAL"}
                      </span>
                    </div>

                    {/* Card number */}
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-mono tracking-[0.2em] font-medium">{card.card_number || "**** **** **** ****"}</p>
                      <button onClick={() => card.card_number && copyNumber(card.card_number, card.id)}
                        className="p-1 rounded hover:bg-white/20 transition-colors text-white/70 hover:text-white">
                        {copiedId === card.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Bottom row: name + expiry + cvv */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase text-white/60 tracking-wider">Cardholder</p>
                        <p className="text-sm font-medium uppercase tracking-wider">{card.cardholder_name}</p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className="text-[10px] uppercase text-white/60 tracking-wider">Expires</p>
                          <p className="text-sm font-medium">{card.expiry_date || "--/--"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase text-white/60 tracking-wider">CVV</p>
                          <button onClick={() => toggleCvv(card.id)} className="flex items-center gap-1 hover:text-white/80 transition-colors">
                            <p className="text-sm font-medium">{showCvv[card.id] ? card.cvv : "***"}</p>
                            {showCvv[card.id] ? <EyeOff className="w-3 h-3 text-white/50" /> : <Eye className="w-3 h-3 text-white/50" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Cards */}
      {pendingCards.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />Pending Approval
          </h2>
          {pendingCards.map((card) => (
            <Card key={card.id} className="border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {card.card_type === "visa_debit" ? "Visa Debit" : card.card_type === "mastercard_debit" ? "Mastercard Debit" : "Virtual Card"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Requested {new Date(card.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-400 font-medium">Pending</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Request New Card */}
      <Card className="border shadow-sm dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#fbbf24]" />Request New Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <Skeleton className="h-20 w-full dark:bg-slate-700" />
          ) : (
            <>
              {/* Card type selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Card Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CARD_TYPES.map((ct) => (
                    <button key={ct.id} onClick={() => setSelectedType(ct.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedType === ct.id
                          ? "border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                          : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                      }`}>
                      <div className={`w-10 h-6 rounded bg-gradient-to-r ${ct.color} mb-2`} />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{ct.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{ct.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cardholder name */}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Cardholder Name</label>
                <input type="text" value={cardholderName} onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="Name as it appears on card"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-300 uppercase" />
              </div>

              {/* Preview card */}
              <div className="relative overflow-hidden rounded-2xl shadow-lg max-w-sm mx-auto">
                <div className={`relative p-6 bg-gradient-to-br ${
                  selectedType === "visa_debit" ? "from-blue-600 via-blue-700 to-indigo-800" :
                  selectedType === "mastercard_debit" ? "from-amber-500 via-orange-600 to-red-700" :
                  "from-emerald-500 via-teal-600 to-cyan-700"
                } text-white`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-8 rounded bg-amber-200/90 flex items-center justify-center">
                          <div className="w-6 h-4 bg-amber-700/20 rounded-sm" />
                        </div>
                        <Wifi className="w-5 h-5 text-white/70 rotate-90" />
                      </div>
                      <span className="text-lg font-bold italic tracking-wider">
                        {selectedType === "visa_debit" ? "VISA" : selectedType === "mastercard_debit" ? "mastercard" : "VIRTUAL"}
                      </span>
                    </div>
                    <p className="text-xl font-mono tracking-[0.2em] font-medium">**** **** **** ****</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase text-white/60 tracking-wider">Cardholder</p>
                        <p className="text-sm font-medium uppercase tracking-wider">{cardholderName || "YOUR NAME"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-white/60 tracking-wider">Expires</p>
                        <p className="text-sm font-medium">MM/YY</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleRequest} disabled={busy}
                className="w-full bg-[#fbbf24] hover:bg-amber-500 disabled:opacity-60 text-slate-900 font-semibold rounded-xl h-12 text-base shadow-md flex items-center justify-center gap-2 transition-all">
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                Request Card
              </button>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">Your request will be reviewed by an admin before approval.</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
