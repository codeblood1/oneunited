import { useAuth } from "@/hooks/useAuth";
import { useAdminUsers } from "@/hooks/useSupabaseData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Users, Search, Shield, ShieldCheck, UserX, UserCheck } from "lucide-react";

export default function AdminUsers() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 20;
  const { users, isLoading, fetchUsers, updateUser } = useAdminUsers();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadUsers = useCallback(() => {
    fetchUsers(search || undefined, roleFilter || undefined, limit, page * limit);
  }, [fetchUsers, search, roleFilter, page]);

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);
  useEffect(() => { if (isAdmin) loadUsers(); }, [loadUsers, isAdmin]);

  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    setProcessingId(userId);
    try {
      await updateUser(userId, { isActive: !currentActive });
      toast.success(`User ${!currentActive ? "activated" : "deactivated"}`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    setProcessingId(userId);
    try {
      await updateUser(userId, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6 dark:bg-slate-700" /><Skeleton className="h-96 dark:bg-slate-700" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1><p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage all user accounts</p></div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-300 shadow-sm" /></div>
        <div className="flex gap-1">
          {["", "user", "admin", "manager"].map((role) => (
            <button key={role || "all"} onClick={() => { setRoleFilter(role); setPage(0); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${roleFilter === role ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent"}`}>{role || "All"}</button>
          ))}
        </div>
      </div>

      <Card className="border shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">KYC</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {isLoading ? [1,2,3,4,5].map((i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-10 w-full dark:bg-slate-700" /></td></tr>) :
                 users.length > 0 ? users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center"><span className="text-xs font-bold text-amber-700 dark:text-amber-400">{u.name?.charAt(0)?.toUpperCase() || "U"}</span></div>
                      <div><p className="text-sm font-medium text-slate-900 dark:text-white">{u.name || "Unnamed"}</p><p className="text-xs text-slate-500 dark:text-slate-400">{u.email || "No email"}</p></div>
                    </div></td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={processingId === u.id}
                        className="text-xs px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-amber-300">
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1">{u.kyc_status === "verified" ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Shield className="w-3.5 h-3.5 text-slate-400" />}<span className={`text-xs ${u.kyc_status === "verified" ? "text-emerald-600" : u.kyc_status === "pending" ? "text-amber-600" : "text-slate-500"}`}>{u.kyc_status}</span></div></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${u.is_active ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-500/20 text-rose-500"}`}>{u.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(u.id, u.is_active)} disabled={processingId === u.id}
                        className={`p-1.5 rounded-lg transition-colors ${u.is_active ? "hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500" : "hover:bg-emerald-50 dark:hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-600"}`}
                        title={u.is_active ? "Deactivate" : "Activate"}>
                        {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"><Users className="w-8 h-8 mx-auto mb-2" /><p>No users found</p></td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
