import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Search, Shield, ShieldCheck, UserX, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminUsers() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data: users, isLoading, refetch } = trpc.admin.listUsers.useQuery({ search: search || undefined, role: (roleFilter as "user" | "admin" | "manager") || undefined, limit, offset: page * limit }, { enabled: isAdmin });
  const updateMutation = trpc.admin.updateUser.useMutation({ onSuccess: () => { refetch(); toast.success("User updated"); }, onError: (err) => toast.error(err.message) });

  useEffect(() => { if (!authLoading && !isAdmin) navigate("/dashboard"); }, [isAdmin, authLoading, navigate]);
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (authLoading || !isAdmin) return <div className="p-6"><Skeleton className="h-8 w-48 mb-6" /><Skeleton className="h-96" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900">Users</h1><p className="text-slate-500 text-sm mt-1">Manage all user accounts</p></div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-amber-300 shadow-sm" /></div>
        <div className="flex gap-1">
          {["", "user", "admin", "manager"].map((role) => (
            <button key={role || "all"} onClick={() => { setRoleFilter(role); setPage(0); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${roleFilter === role ? "bg-amber-50 text-amber-700 border border-amber-200" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent"}`}>{role || "All"}</button>
          ))}
        </div>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Role</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">KYC</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {isLoading ? [1,2,3,4,5].map((i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-10 w-full" /></td></tr>) :
                 users && users.length > 0 ? users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3"><div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center"><span className="text-xs font-bold text-amber-700">{user.name?.charAt(0)?.toUpperCase() || "U"}</span></div>
                      <div><p className="text-sm font-medium text-slate-900">{user.name || "Unnamed"}</p><p className="text-xs text-slate-500">{user.email || "No email"}</p></div>
                    </div></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${user.role === "admin" ? "bg-amber-50 text-amber-700" : user.role === "manager" ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-600"}`}>{user.role}</span></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1">{user.kycStatus === "verified" ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Shield className="w-3.5 h-3.5 text-slate-400" />}<span className={`text-xs ${user.kycStatus === "verified" ? "text-emerald-600" : user.kycStatus === "pending" ? "text-amber-600" : "text-slate-500"}`}>{user.kycStatus}</span></div></td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${user.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>{user.isActive ? "Active" : "Inactive"}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1">
                      {user.isActive ? <button onClick={() => updateMutation.mutate({ userId: user.id, isActive: false })} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors" title="Deactivate"><UserX className="w-4 h-4" /></button>
                        : <button onClick={() => updateMutation.mutate({ userId: user.id, isActive: true })} className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors" title="Activate"><UserCheck className="w-4 h-4" /></button>}
                      {user.role === "user" && <button onClick={() => { if (confirm(`Promote ${user.name || "this user"} to manager?`)) updateMutation.mutate({ userId: user.id, role: "manager" }); }} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors" title="Make Manager"><Shield className="w-4 h-4" /></button>}
                    </div></td>
                  </tr>
                )) : <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500"><Users className="w-8 h-8 mx-auto mb-2" /><p>No users found</p></td></tr>}
              </tbody>
            </table>
          </div>
          {users && users.length === limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs text-slate-500">Page {page + 1}</span>
              <button onClick={() => setPage(page + 1)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><ChevronRight className="w-4 h-4" /></button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
