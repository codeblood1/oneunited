import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { ShieldCheck, Shield, Clock, XCircle, CheckCircle2, Upload, FileText, Loader2 } from "lucide-react";

export default function Verification() {
  const utils = trpc.useUtils();
  const { data: kycData, isLoading } = trpc.kyc.getStatus.useQuery();
  const submitMutation = trpc.kyc.submit.useMutation({
    onSuccess: () => { utils.kyc.getStatus.invalidate(); toast.success("Verification submitted"); setStep("submitted"); },
    onError: (err) => toast.error(err.message),
  });

  const [step, setStep] = useState<"status" | "form" | "submitted">("status");
  const [idType, setIdType] = useState<"passport" | "drivers_license" | "national_id">("passport");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");

  const kycStatus = kycData?.status || "unverified";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber) { toast.error("ID number is required"); return; }
    submitMutation.mutate({ idType, idNumber, address: address || undefined, city: city || undefined, state: state || undefined, zipCode: zipCode || undefined, country: country || undefined });
  };

  const getStatusIcon = () => {
    switch (kycStatus) {
      case "verified": return <ShieldCheck className="w-16 h-16 text-emerald-600" />;
      case "pending": return <Clock className="w-16 h-16 text-amber-500" />;
      case "rejected": return <XCircle className="w-16 h-16 text-rose-500" />;
      default: return <Shield className="w-16 h-16 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (kycStatus) {
      case "verified": return { title: "Identity Verified", description: "Your identity has been verified. Full access granted.", color: "text-emerald-600" };
      case "pending": return { title: "Verification Pending", description: "Under review. Usually takes 1-2 business days.", color: "text-amber-600" };
      case "rejected": return { title: "Verification Rejected", description: "Please check feedback and submit again.", color: "text-rose-600" };
      default: return { title: "Identity Unverified", description: "Complete verification for higher transfer limits.", color: "text-slate-600" };
    }
  };

  const statusInfo = getStatusText();

  if (isLoading) return <div className="p-6 max-w-2xl mx-auto"><div className="h-64 bg-slate-100 rounded-2xl animate-pulse" /></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Identity Verification</h1>
        <p className="text-slate-500 text-sm mt-1">Verify your identity for secure banking</p>
      </div>

      {(step === "status" || step === "submitted") && (
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <h2 className={`text-xl font-bold mb-2 ${statusInfo.color}`}>{step === "submitted" ? "Verification Submitted" : statusInfo.title}</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">{step === "submitted" ? "Submitted for review. You'll be notified once processed." : statusInfo.description}</p>
            {kycStatus === "unverified" && step !== "submitted" && <Button onClick={() => setStep("form")} className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full shadow-md"><FileText className="w-4 h-4 mr-2" />Start Verification</Button>}
            {kycStatus === "rejected" && <Button onClick={() => setStep("form")} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 rounded-full">Submit Again</Button>}
            {step === "submitted" && <div className="flex items-center justify-center gap-2 text-emerald-600"><CheckCircle2 className="w-5 h-5" /><span className="text-sm font-medium">Submitted successfully</span></div>}
          </CardContent>
        </Card>
      )}

      {step === "form" && (
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader><CardTitle className="text-base font-semibold text-slate-900">Verification Form</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ID Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {([{ value: "passport", label: "Passport" }, { value: "drivers_license", label: "Driver's License" }, { value: "national_id", label: "National ID" }] as const).map((option) => (
                    <button key={option.value} type="button" onClick={() => setIdType(option.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${idType === option.value ? "border-amber-300 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"}`}>{option.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ID Number *</label>
                <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Enter your ID number"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-2">City</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">State</label><input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label><input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="ZIP" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-2">Country</label><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" /></div>
              </div>
              <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Document upload available after initial review</p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep("status")} className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full">Cancel</Button>
                <Button type="submit" disabled={submitMutation.isPending || !idNumber} className="flex-1 bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full shadow-md">
                  {submitMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}Submit Verification
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
