import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Shield, Bell, Moon, Smartphone, LogOut } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader><CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2"><User className="w-4 h-4 text-[#fbbf24]" />Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-16 h-16 rounded-full object-cover" /> : <span className="text-xl font-bold text-amber-700">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{user?.name || "User"}</p>
              <p className="text-sm text-slate-500">{user?.email || ""}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><p className="text-xs text-slate-500 mb-1">Member Since</p><p className="text-sm font-medium text-slate-900">{user?.createdAt ? formatDate(user.createdAt) : "N/A"}</p></div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><p className="text-xs text-slate-500 mb-1">Role</p><p className="text-sm font-medium text-slate-900 capitalize">{user?.role || "User"}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader><CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2"><Shield className="w-4 h-4 text-[#fbbf24]" />Security</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3"><Shield className="w-4 h-4 text-emerald-600" /><div><p className="text-sm font-medium text-slate-900">KYC Status</p><p className="text-xs text-slate-500">Identity verification</p></div></div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user?.kycStatus === "verified" ? "bg-emerald-50 text-emerald-600" : user?.kycStatus === "pending" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-500"}`}>{user?.kycStatus || "unverified"}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3"><Bell className="w-4 h-4 text-indigo-600" /><div><p className="text-sm font-medium text-slate-900">Notifications</p><p className="text-xs text-slate-500">Push and email alerts</p></div></div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Coming soon")} className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">Configure</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3"><Moon className="w-4 h-4 text-indigo-600" /><div><p className="text-sm font-medium text-slate-900">Dark Mode</p><p className="text-xs text-slate-500">Currently using light theme</p></div></div>
            <span className="text-xs text-slate-400 font-medium">Off</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-indigo-600" /><div><p className="text-sm font-medium text-slate-900">Two-Factor Auth</p><p className="text-xs text-slate-500">Add extra security</p></div></div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Coming soon")} className="border-slate-200 text-slate-600 hover:bg-slate-50 text-xs">Enable</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border border-rose-200 shadow-sm">
        <CardContent className="p-6">
          <Button onClick={logout} variant="outline" className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full"><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
        </CardContent>
      </Card>
    </div>
  );
}
