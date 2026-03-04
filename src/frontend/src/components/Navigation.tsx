import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  Heart,
  Home,
  ScanLine,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerAdmin } from "../hooks/useQueries";

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: "/dashboard", icon: <Home size={20} />, label: "Home" },
  { to: "/analyze", icon: <ScanLine size={20} />, label: "Analyze" },
  { to: "/history", icon: <ClipboardList size={20} />, label: "History" },
  { to: "/doctors", icon: <Stethoscope size={20} />, label: "Doctors" },
  { to: "/profile", icon: <User size={20} />, label: "Profile" },
  {
    to: "/admin",
    icon: <ShieldCheck size={20} />,
    label: "Admin",
    adminOnly: true,
  },
];

export default function Navigation() {
  const { pathname } = useRouterState({ select: (s) => s.location });
  const { data: isAdmin } = useIsCallerAdmin();
  const { clear } = useInternetIdentity();

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col bg-sidebar z-40 border-r border-sidebar-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <img
            src="/assets/generated/logo-health-vision-transparent.dim_120x120.png"
            alt="AI Health Vision"
            className="w-9 h-9 object-contain"
          />
          <div>
            <p className="text-xs font-medium text-sidebar-foreground/60 leading-none">
              AI Health
            </p>
            <p className="text-sm font-semibold text-sidebar-foreground leading-tight">
              Vision
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.to ||
              (item.to !== "/dashboard" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid="nav.link"
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-all duration-150"
          >
            <User size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {visibleItems.slice(0, 5).map((item) => {
            const isActive =
              pathname === item.to ||
              (item.to !== "/dashboard" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                data-ocid="nav.link"
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[48px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "p-1 rounded-lg transition-all",
                    isActive && "bg-primary/10",
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium leading-none">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-8 h-8 rounded-full medical-gradient flex items-center justify-center">
        <Heart size={16} className="text-white" />
      </div>
      <span className="font-display font-semibold text-lg text-foreground">
        AI Health Vision
      </span>
    </div>
  );
}
