import { useKyc, uploadKycDocument, COUNTRIES } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import {
  ShieldCheck, Shield, Clock, XCircle, CheckCircle2, Upload, FileText, Loader2,
  Image, X, Globe, MapPin,
} from "lucide-react";

export default function Verification() {
  const { user } = useAuth();
  const { kycData, isLoading, submitKyc } = useKyc();
  const [step, setStep] = useState<"status" | "form" | "submitted">("status");
  const [idType, setIdType] = useState<"passport" | "drivers_license" | "national_id">("passport");
  const [idNumber, setIdNumber] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const kycStatus = user?.kycStatus || "unverified";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    if (type === "front") { setFrontFile(file); setFrontPreview(URL.createObjectURL(file)); }
    else { setBackFile(file); setBackPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber) { toast.error("ID number is required"); return; }
    setIsSubmitting(true);

    try {
      let frontUrl = "";
      let backUrl = "";
      if (frontFile) { toast.loading("Uploading front document..."); frontUrl = await uploadKycDocument(frontFile, "front"); toast.dismiss(); }
      if (backFile) { toast.loading("Uploading back document..."); backUrl = await uploadKycDocument(backFile, "back"); toast.dismiss(); }

      const result = await submitKyc({ idType, idNumber, address, city, state, zipCode, country, frontImageUrl: frontUrl || undefined, backImageUrl: backUrl || undefined });
      if (result.success) { setStep("submitted"); toast.success("Verification submitted successfully"); }
      else { toast.error(result.error || "Submission failed"); }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
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

  if (isLoading) return <div className="p-6 max-w-2xl mx-auto"><div className="h-64 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse" /></div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Identity Verification</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Verify your identity for secure banking</p>
      </div>

      {(step === "status" || step === "submitted") && (
        <Card className="border shadow-sm dark:border-slate-700">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <h2 className={`text-xl font-bold mb-2 ${statusInfo.color}`}>{step === "submitted" ? "Verification Submitted" : statusInfo.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">{step === "submitted" ? "Submitted for review. You'll be notified once processed." : statusInfo.description}</p>
            {kycStatus === "unverified" && step !== "submitted" && (
              <button onClick={() => setStep("form")} className="bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full px-6 py-2.5 shadow-md shadow-amber-400/20 flex items-center gap-2 text-sm transition-all mx-auto">
                <FileText className="w-4 h-4" />Start Verification
              </button>
            )}
            {kycStatus === "rejected" && (
              <button onClick={() => setStep("form")} className="border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-full px-6 py-2.5 text-sm font-medium transition-all">
                Submit Again
              </button>
            )}
            {step === "submitted" && <div className="flex items-center justify-center gap-2 text-emerald-600"><CheckCircle2 className="w-5 h-5" /><span className="text-sm font-medium">Submitted successfully</span></div>}
          </CardContent>
        </Card>
      )}

      {step === "form" && (
        <Card className="border shadow-sm dark:border-slate-700">
          <CardHeader><CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Verification Form</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ID Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ID Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {([{ value: "passport", label: "Passport" }, { value: "drivers_license", label: "Driver's License" }, { value: "national_id", label: "National ID" }] as const).map((option) => (
                    <button key={option.value} type="button" onClick={() => setIdType(option.value)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${idType === option.value ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-500/20 dark:text-amber-400" : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400"}`}>{option.label}</button>
                  ))}
                </div>
              </div>

              {/* ID Number */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ID Number *</label>
                <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Enter your ID number" required
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">City</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">State</label><input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ZIP Code</label><input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="ZIP" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" /></div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select value={country} onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-amber-300 appearance-none cursor-pointer shadow-sm">
                      <option value="">Select country</option>
                      {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">ID Documents</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Front */}
                  <div className={`relative p-4 rounded-xl border-2 border-dashed text-center transition-all ${frontPreview ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-300 bg-slate-50 dark:bg-slate-700/50 hover:border-amber-300 dark:border-slate-600"}`}>
                    {frontPreview ? (
                      <div className="space-y-2">
                        <Image className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-xs text-emerald-600 font-medium">Front uploaded</p>
                        <button type="button" onClick={() => { setFrontFile(null); setFrontPreview(null); }} className="text-xs text-rose-500 hover:underline">Remove</button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">ID Front</p>
                        <p className="text-[10px] text-slate-400">Click to upload</p>
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileChange(e, "front")} />
                      </label>
                    )}
                  </div>
                  {/* Back */}
                  <div className={`relative p-4 rounded-xl border-2 border-dashed text-center transition-all ${backPreview ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-500/10" : "border-slate-300 bg-slate-50 dark:bg-slate-700/50 hover:border-amber-300 dark:border-slate-600"}`}>
                    {backPreview ? (
                      <div className="space-y-2">
                        <Image className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-xs text-emerald-600 font-medium">Back uploaded</p>
                        <button type="button" onClick={() => { setBackFile(null); setBackPreview(null); }} className="text-xs text-rose-500 hover:underline">Remove</button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">ID Back</p>
                        <p className="text-[10px] text-slate-400">Click to upload</p>
                        <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFileChange(e, "back")} />
                      </label>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Max 5MB. Images or PDF accepted.</p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("status")} className="flex-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full py-2.5 text-sm font-medium transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting || !idNumber}
                  className="flex-1 bg-[#fbbf24] hover:bg-amber-500 text-slate-900 font-semibold rounded-full py-2.5 shadow-md flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}Submit Verification
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
