import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme, useNotifications, uploadAvatar } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, Shield, Bell, Moon, Smartphone, LogOut, Camera, X, Check, Trash2,
  Upload, ChevronRight, Volume2, Mail, MessageSquare, Loader2,
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllRead, isLoading: notifLoading } = useNotifications();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    push: localStorage.getItem("notif_push") !== "false",
    email: localStorage.getItem("notif_email") !== "false",
    sms: localStorage.getItem("notif_sms") === "true",
    security: localStorage.getItem("notif_security") !== "false",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setAvatarLoading(true);
    try {
      const url = await uploadAvatar(file);
      toast.success("Profile photo updated");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleNotifToggle = (key: keyof typeof notifSettings) => {
    const newVal = !notifSettings[key];
    setNotifSettings(prev => ({ ...prev, [key]: newVal }));
    localStorage.setItem(`notif_${key}`, String(newVal));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${newVal ? "enabled" : "disabled"}`);
  };

  const initials = (user?.name || "User").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="border shadow-sm dark:border-slate-700">
        <CardHeader><CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2"><User className="w-4 h-4 text-[#fbbf24]" />Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center overflow-hidden border-2 border-amber-200 dark:border-amber-500/30">
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{initials}</span>
                )}
              </div>
              <button onClick={() => fileRef.current?.click()} disabled={avatarLoading}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#fbbf24] hover:bg-amber-500 text-slate-900 flex items-center justify-center shadow-md transition-all">
                {avatarLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{user?.name || "User"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || ""}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 capitalize">{user?.kycStatus || "unverified"}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Member Since</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.createdAt ? formatDate(user.createdAt) : "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border shadow-sm dark:border-slate-700">
        <CardHeader><CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Shield className="w-4 h-4 text-[#fbbf24]" />Security</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {/* KYC */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
            <div className="flex items-center gap-3"><Shield className="w-4 h-4 text-emerald-600" /><div><p className="text-sm font-medium text-slate-900 dark:text-white">KYC Status</p><p className="text-xs text-slate-500 dark:text-slate-400">Identity verification</p></div></div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user?.kycStatus === "verified" ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : user?.kycStatus === "pending" ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400" : "bg-rose-50 dark:bg-rose-500/20 text-rose-500"}`}>{user?.kycStatus || "unverified"}</span>
          </div>

          {/* Notifications */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowNotifs(!showNotifs)}>
              <div className="flex items-center gap-3"><Bell className="w-4 h-4 text-indigo-600" /><div><p className="text-sm font-medium text-slate-900 dark:text-white">Notifications</p><p className="text-xs text-slate-500 dark:text-slate-400">{unreadCount > 0 ? `${unreadCount} unread` : "Push and email alerts"}</p></div></div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">{unreadCount}</span>}
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showNotifs ? "rotate-90" : ""}`} />
              </div>
            </div>

            {showNotifs && (
              <div className="mt-4 space-y-4 border-t border-slate-200 dark:border-slate-600 pt-4">
                {/* Recent notifications */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Recent</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-amber-600 hover:underline">Mark all read</button>
                    )}
                  </div>
                  {notifLoading ? (
                    [1, 2].map(i => <Skeleton key={i} className="h-12" />)
                  ) : notifications.length > 0 ? (
                    notifications.slice(0, 5).map(n => (
                      <div key={n.id} onClick={() => markAsRead(n.id)}
                        className={`p-2.5 rounded-lg cursor-pointer transition-all ${n.is_read ? "bg-transparent" : "bg-amber-50 dark:bg-amber-500/10"} hover:bg-slate-100 dark:hover:bg-slate-600`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? "bg-slate-300 dark:bg-slate-600" : "bg-amber-500"}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${n.is_read ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-white"}`}>{n.title}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-2">No notifications yet</p>
                  )}
                </div>

                {/* Toggle settings */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-600 pt-3">
                  {([
                    { key: "push" as const, label: "Push Notifications", icon: Volume2, desc: "In-app alerts" },
                    { key: "email" as const, label: "Email Notifications", icon: Mail, desc: "Updates via email" },
                    { key: "sms" as const, label: "SMS Alerts", icon: MessageSquare, desc: "Text messages" },
                    { key: "security" as const, label: "Security Alerts", icon: Shield, desc: "Login and security events" },
                  ]).map(item => (
                    <div key={item.key} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <item.icon className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.label}</p>
                          <p className="text-[10px] text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleNotifToggle(item.key)}
                        className={`w-9 h-5 rounded-full transition-all relative ${notifSettings[item.key] ? "bg-[#fbbf24]" : "bg-slate-300 dark:bg-slate-600"}`}>
                        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${notifSettings[item.key] ? "left-[18px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
            <div className="flex items-center gap-3"><Moon className="w-4 h-4 text-indigo-600" /><div><p className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</p><p className="text-xs text-slate-500 dark:text-slate-400">{isDark ? "Dark theme active" : "Light theme active"}</p></div></div>
            <button onClick={toggleTheme} className={`w-11 h-6 rounded-full transition-all relative ${isDark ? "bg-[#fbbf24]" : "bg-slate-300 dark:bg-slate-600"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${isDark ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          {/* Two-Factor */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
            <div className="flex items-center gap-3"><Smartphone className="w-4 h-4 text-indigo-600" /><div><p className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Auth</p><p className="text-xs text-slate-500 dark:text-slate-400">Add extra security</p></div></div>
            <button onClick={() => toast.info("Coming soon")} className="text-xs border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-all">Enable</button>
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card className="border border-rose-200 dark:border-rose-900/50 shadow-sm">
        <CardContent className="p-6">
          <button onClick={logout} className="w-full border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-all">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
