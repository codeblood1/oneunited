import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Users,
  Receipt,
  UserCheck,
  BarChart3,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const userNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", path: "/accounts", icon: Wallet },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Transfer", path: "/transfer", icon: ArrowLeftRight },
  { label: "Verification", path: "/verification", icon: ShieldCheck },
  { label: "Settings", path: "/settings", icon: Settings },
];

const adminNavItems = [
  { label: "Admin Dashboard", path: "/admin", icon: BarChart3 },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Transactions", path: "/admin/transactions", icon: Receipt },
  { label: "KYC Reviews", path: "/admin/kyc", icon: UserCheck },
  { label: "Accounts", path: "/admin/accounts", icon: Landmark },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const isAdminRoute = location.pathname.startsWith("/admin");
  const navItems = isAdminRoute ? adminNavItems : userNavItems;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-30 shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#fbbf24] flex items-center justify-center shadow-md">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">OneUnited</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#fbbf24]/10 text-amber-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {isAdmin && !isAdminRoute && (
          <div className="px-3 pb-2">
            <Link
              to="/admin"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <BarChart3 className="w-4.5 h-4.5" />
              Admin Panel
            </Link>
          </div>
        )}

        {isAdmin && isAdminRoute && (
          <div className="px-3 pb-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              User View
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#fbbf24]/20 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-700">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-slate-900">{user.name || "User"}</p>
              <p className="text-xs text-slate-500 truncate">{user.email || ""}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start text-slate-500 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 flex items-center px-4 shadow-sm">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-700"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center gap-2 ml-3">
          <div className="w-7 h-7 rounded-lg bg-[#fbbf24] flex items-center justify-center shadow-sm">
            <Landmark className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900">OneUnited</span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-200 shadow-lg ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#fbbf24]/10 text-amber-700"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { logout(); setMobileOpen(false); }}
            className="w-full justify-start text-slate-500 hover:text-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
