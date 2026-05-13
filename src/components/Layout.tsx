import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, ShieldCheck, Settings,
  LogOut, Menu, X, ChevronRight, Users, Receipt, UserCheck,
  BarChart3, Landmark, CreditCard,
} from "lucide-react";

const userNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", path: "/accounts", icon: Wallet },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Transfer", path: "/transfer", icon: ArrowLeftRight },
  { label: "Cards", path: "/cards", icon: CreditCard },
  { label: "Verify", path: "/verification", icon: ShieldCheck },
  { label: "Settings", path: "/settings", icon: Settings },
];

const adminNavItems = [
  { label: "Overview", path: "/admin", icon: BarChart3 },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Transactions", path: "/admin/transactions", icon: Receipt },
  { label: "KYC", path: "/admin/kyc", icon: UserCheck },
  { label: "Accounts", path: "/admin/accounts", icon: Landmark },
  { label: "Cards", path: "/admin/cards", icon: CreditCard },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Layout only renders when user exists (ProtectedRoute guards this)
  // No navigate() here — all redirects are handled in App.tsx

  const isAdminRoute = location.pathname.startsWith("/admin");
  const navItems = isAdminRoute ? adminNavItems : userNavItems;
  const initials = (user?.name || "User").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const avatarUrl = user?.avatar;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 fixed h-full z-30 shadow-sm">
        <div className="p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-[#fbbf24] flex items-center justify-center shadow-md shadow-amber-400/25">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">OneUnited</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}>
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {isAdmin && !isAdminRoute && (
          <div className="px-3 pb-2">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-all">
              <BarChart3 className="w-[18px] h-[18px]" />Admin Panel
            </Link>
          </div>
        )}
        {isAdmin && isAdminRoute && (
          <div className="px-3 pb-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              <LayoutDashboard className="w-[18px] h-[18px]" />Banking
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="text-amber-700 dark:text-amber-400 font-bold text-xs">{initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate dark:text-white">{user?.name || "User"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" />Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 z-50 flex items-center justify-between px-4 transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-7 h-7 rounded-lg bg-[#fbbf24] flex items-center justify-center shadow-sm">
            <Landmark className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">OneUnited</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center overflow-hidden">
          {avatarUrl ? <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="text-amber-700 dark:text-amber-400 font-bold text-xs">{initials}</span>}
        </div>
      </div>

      {/* ===== MOBILE OVERLAY ===== */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />}

      {/* ===== MOBILE SIDEBAR DRAWER ===== */}
      <aside className={`lg:hidden fixed top-14 left-0 bottom-0 w-[280px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 transform transition-transform duration-200 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center overflow-hidden">
              {avatarUrl ? <img src={avatarUrl} alt="" className="w-11 h-11 rounded-full object-cover" /> : <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">{initials}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate dark:text-white">{user?.name || "User"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
              {user?.isAdmin && <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium">Admin</span>}
            </div>
          </div>
        </div>

        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}>
                <Icon className="w-[18px] h-[18px]" />{item.label}
              </Link>
            );
          })}
        </nav>

        {isAdmin && (
          <div className="p-2 border-t border-slate-100 dark:border-slate-700 mt-2">
            <Link to={isAdminRoute ? "/dashboard" : "/admin"} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-all">
              {isAdminRoute ? <LayoutDashboard className="w-[18px] h-[18px]" /> : <BarChart3 className="w-[18px] h-[18px]" />}
              {isAdminRoute ? "Back to Banking" : "Admin Panel"}
            </Link>
          </div>
        )}

        <div className="p-2 border-t border-slate-100 dark:border-slate-700 mt-2">
          <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <LogOut className="w-[18px] h-[18px]" />Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-40 flex items-center justify-around px-1 safe-area-pb">
        {userNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all ${
                isActive ? "text-amber-600 bg-amber-50 dark:bg-amber-500/20" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Link to="/settings"
          className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all ${
            location.pathname === "/settings" ? "text-amber-600 bg-amber-50 dark:bg-amber-500/20" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}>
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </Link>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0 pb-20 lg:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
