import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Wallet, ArrowLeftRight, ShieldCheck, Settings,
  LogOut, Menu, X, ChevronRight, Users, Receipt, UserCheck,
  BarChart3, Landmark, Home,
} from "lucide-react";

const userNavItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Accounts", path: "/accounts", icon: Wallet },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Transfer", path: "/transfer", icon: ArrowLeftRight },
  { label: "Verify", path: "/verification", icon: ShieldCheck },
  { label: "Settings", path: "/settings", icon: Settings },
];

const adminNavItems = [
  { label: "Overview", path: "/admin", icon: BarChart3 },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Transactions", path: "/admin/transactions", icon: Receipt },
  { label: "KYC", path: "/admin/kyc", icon: UserCheck },
  { label: "Accounts", path: "/admin/accounts", icon: Landmark },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Track scroll for header shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!user) {
    navigate("/login");
    return null;
  }

  const isAdminRoute = location.pathname.startsWith("/admin");
  const navItems = isAdminRoute ? adminNavItems : userNavItems;
  const initials = (user.name || "User").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed h-full z-30 shadow-sm">
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-[#fbbf24] flex items-center justify-center shadow-md shadow-amber-400/25">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">OneUnited</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-amber-50 text-amber-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Admin toggle */}
        {isAdmin && !isAdminRoute && (
          <div className="px-3 pb-2">
            <Link to="/admin"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all">
              <BarChart3 className="w-[18px] h-[18px]" />
              Admin Panel
            </Link>
          </div>
        )}
        {isAdmin && isAdminRoute && (
          <div className="px-3 pb-2">
            <Link to="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all">
              <LayoutDashboard className="w-[18px] h-[18px]" />
              Banking
            </Link>
          </div>
        )}

        {/* User section */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || "User"}</p>
              <p className="text-xs text-slate-400 truncate">{user.email || ""}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 z-50 flex items-center justify-between px-4 transition-shadow ${scrolled ? "shadow-sm" : ""}`}>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="w-7 h-7 rounded-lg bg-[#fbbf24] flex items-center justify-center shadow-sm">
            <Landmark className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">OneUnited</span>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
          {initials}
        </div>
      </div>

      {/* ===== MOBILE OVERLAY ===== */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* ===== MOBILE SIDEBAR DRAWER ===== */}
      <aside className={`lg:hidden fixed top-14 left-0 bottom-0 w-[280px] bg-white border-r border-slate-200 z-40 transform transition-transform duration-200 ease-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"} overflow-y-auto`}>
        {/* User card */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name || "User"}</p>
              <p className="text-xs text-slate-400 truncate">{user.email || ""}</p>
              {user.isAdmin && (
                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-amber-50 text-amber-700 shadow-sm" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
                onClick={() => setMobileOpen(false)}>
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin toggle */}
        {isAdmin && (
          <div className="p-2 border-t border-slate-100 mt-2">
            <Link to={isAdminRoute ? "/dashboard" : "/admin"}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all"
              onClick={() => setMobileOpen(false)}>
              {isAdminRoute ? <LayoutDashboard className="w-[18px] h-[18px]" /> : <BarChart3 className="w-[18px] h-[18px]" />}
              {isAdminRoute ? "Back to Banking" : "Admin Panel"}
            </Link>
          </div>
        )}

        {/* Logout */}
        <div className="p-2 border-t border-slate-100 mt-2">
          <button onClick={() => { logout(); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex items-center justify-around px-1 safe-area-pb">
        {userNavItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all ${
                isActive ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-slate-600"
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Link to="/settings"
          className={`flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all ${
            location.pathname === "/settings" ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-slate-600"
          }`}>
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">More</span>
        </Link>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile: add padding for header + bottom nav */}
        <div className="pt-14 lg:pt-0 pb-20 lg:pb-0">
          {children}
        </div>
      </main>
    </div>
  );
}
