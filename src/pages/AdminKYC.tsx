import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, XCircle, FileText, Loader2, User, MapPin, CreditCard } from "lucide-react";

export default function AdminKYC() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const { data: kycList, isLoading, refetch } = trpc.kyc.adminList.useQuery({ status: (statusFilter as "pending" | "approved" | "rejected") || undefined, limit: 100 }, { enabled: isAdmin });
  const updateMutation = trpc.kyc.adminUpdate.useMutation({ onSuccess: () => { refetch(); toast.success("KYC updated"); setReviewingId(null); setReviewNote(""); }, onError: (err) => toast.error(err.message) });

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">KYC Reviews</h1><p className="text-slate-500 text-sm mt-1">Review user identity verification submissions</p></div>

      <div className="flex gap-1">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? [1,2,3,4].map((i) => <Skeleton key={i} className="h-64" />) :
         kycList && kycList.length > 0 ? kycList.map((kyc) => (
          <Card key={kyc.id} className="bg-white border border-slate-200 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center"><User className="w-5 h-5 text-indigo-600" /></div>
                  <div><p className="text-sm font-semibold text-slate-900">User #{kyc.userId}</p><p className="text-xs text-slate-500">Submitted {formatDate(kyc.submittedAt)}</p></div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${kyc.status === "approved" ? "bg-emerald-50 text-emerald-600" : kyc.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-500"}`}>{kyc.status}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><CreditCard className="w-4 h-4 text-slate-400" /><span className="text-slate-500">ID Type:</span><span className="text-slate-900 capitalize">{kyc.idType.replace("_", " ")}</span></div>
                <div className="flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-slate-400" /><span className="text-slate-500">ID Number:</span><span className="text-slate-900 font-mono">{kyc.idNumber}</span></div>
                {kyc.address && <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400 mt-0.5" /><span className="text-slate-500">Address:</span><span className="text-slate-900">{kyc.address}{kyc.city && `, ${kyc.city}`}{kyc.state && `, ${kyc.state}`}{kyc.zipCode && ` ${kyc.zipCode}`}{kyc.country && `, ${kyc.country}`}</span></div>}
              </div>
              {kyc.status === "pending" && <div className="space-y-3 pt-2">
                <textarea value={reviewingId === kyc.id ? reviewNote : ""} onChange={(e) => { setReviewingId(kyc.id); setReviewNote(e.target.value); }} placeholder="Add review note (optional)..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 resize-none h-20" />
                <div className="flex gap-2">
                  <Button onClick={() => updateMutation.mutate({ kycId: kyc.id, status: "approved", adminNote: reviewNote })} disabled={updateMutation.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">{updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}Approve</Button>
                  <Button onClick={() => updateMutation.mutate({ kycId: kyc.id, status: "rejected", adminNote: reviewNote })} disabled={updateMutation.isPending}
                    variant="outline" className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full">{updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}Reject</Button>
                </div>
              </div>}
              {kyc.adminNote && <div className="p-3 rounded-lg bg-slate-50 border border-slate-100"><p className="text-xs text-slate-500">Admin Note:</p><p className="text-sm text-slate-900 mt-1">{kyc.adminNote}</p></div>}
            </CardContent>
          </Card>
        )) : <div className="col-span-2 text-center py-12"><ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500">No KYC submissions found</p></div>}
      </div>
    </div>
  );
}
