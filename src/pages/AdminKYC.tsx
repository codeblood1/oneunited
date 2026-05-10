import { useAuth } from "@/hooks/useAuth";
import { useAdminKyc } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, CheckCircle2, XCircle, FileText, Loader2, User, MapPin, CreditCard, Image } from "lucide-react";

export default function AdminKYC() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const { kycList, isLoading, fetchKyc, updateKyc } = useAdminKyc();
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);
  useEffect(() => { fetchKyc(statusFilter); }, [statusFilter, fetchKyc]);

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const handleApprove = async (kycId: number) => {
    setProcessingId(kycId);
    try {
      await updateKyc(kycId, "approved", reviewingId === kycId ? reviewNote : undefined);
      toast.success("KYC approved");
      setReviewingId(null);
      setReviewNote("");
      fetchKyc(statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (kycId: number) => {
    setProcessingId(kycId);
    try {
      await updateKyc(kycId, "rejected", reviewingId === kycId ? reviewNote : undefined);
      toast.success("KYC rejected");
      setReviewingId(null);
      setReviewNote("");
      fetchKyc(statusFilter);
    } catch (err: any) {
      toast.error(err.message || "Failed to reject");
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6 dark:bg-slate-700" /><Skeleton className="h-96 dark:bg-slate-700" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">KYC Reviews</h1><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review user identity verification submissions</p></div>

      <div className="flex gap-1">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? [1,2,3,4].map((i) => <Skeleton key={i} className="h-64 dark:bg-slate-700" />) :
         kycList.length > 0 ? kycList.map((kyc) => (
          <Card key={kyc.id} className="border shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center"><User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                  <div><p className="text-sm font-semibold text-slate-900 dark:text-white">User #{kyc.user_id}</p><p className="text-xs text-slate-500 dark:text-slate-400">Submitted {formatDate(kyc.submitted_at)}</p></div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${kyc.status === "approved" ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : kyc.status === "pending" ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" : "bg-rose-50 dark:bg-rose-500/20 text-rose-500"}`}>{kyc.status}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm"><CreditCard className="w-4 h-4 text-slate-400" /><span className="text-slate-500 dark:text-slate-400">ID Type:</span><span className="text-slate-900 dark:text-white capitalize">{kyc.id_type?.replace("_", " ")}</span></div>
                <div className="flex items-center gap-2 text-sm"><FileText className="w-4 h-4 text-slate-400" /><span className="text-slate-500 dark:text-slate-400">ID Number:</span><span className="text-slate-900 dark:text-white font-mono">{kyc.id_number}</span></div>
                {kyc.address && <div className="flex items-start gap-2 text-sm"><MapPin className="w-4 h-4 text-slate-400 mt-0.5" /><span className="text-slate-500 dark:text-slate-400">Address:</span><span className="text-slate-900 dark:text-white">{kyc.address}{kyc.city && `, ${kyc.city}`}{kyc.state && `, ${kyc.state}`}{kyc.zip_code && ` ${kyc.zip_code}`}{kyc.country && `, ${kyc.country}`}</span></div>}
              </div>
              {/* Document images */}
              {(kyc.id_front_image || kyc.id_back_image) && (
                <div className="flex gap-2">
                  {kyc.id_front_image && (
                    <a href={kyc.id_front_image} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-amber-600 hover:underline">
                      <Image className="w-3.5 h-3.5" />View Front
                    </a>
                  )}
                  {kyc.id_back_image && (
                    <a href={kyc.id_back_image} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-amber-600 hover:underline">
                      <Image className="w-3.5 h-3.5" />View Back
                    </a>
                  )}
                </div>
              )}
              {kyc.status === "pending" && <div className="space-y-3 pt-2">
                <textarea value={reviewingId === kyc.id ? reviewNote : ""} onChange={(e) => { setReviewingId(kyc.id); setReviewNote(e.target.value); }} placeholder="Add review note (optional)..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 resize-none h-20" />
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(kyc.id)} disabled={processingId === kyc.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full py-2 flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50">
                    {processingId === kyc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}Approve
                  </button>
                  <button onClick={() => handleReject(kyc.id)} disabled={processingId === kyc.id}
                    className="flex-1 border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full py-2 flex items-center justify-center gap-2 text-sm font-medium transition-all disabled:opacity-50">
                    {processingId === kyc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Reject
                  </button>
                </div>
              </div>}
              {kyc.admin_note && <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400">Admin Note:</p><p className="text-sm text-slate-900 dark:text-white mt-1">{kyc.admin_note}</p></div>}
            </CardContent>
          </Card>
        )) : <div className="col-span-2 text-center py-12"><ShieldCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-slate-500 dark:text-slate-400">No KYC submissions found</p></div>}
      </div>
    </div>
  );
}
