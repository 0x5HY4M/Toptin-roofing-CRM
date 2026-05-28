import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { UserButton } from "@clerk/react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  HardHat,
  Calendar,
  CheckSquare,
  Box,
  Settings,
  LogOut,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCommandPalette } from "@/components/CommandPalette";
import { NotificationBell } from "@/components/NotificationBell";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/estimates", label: "Estimates", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: Receipt },
  { href: "/crew", label: "Crew", icon: HardHat },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/materials", label: "Materials", icon: Box },
  { href: "/settings", label: "Settings", icon: Settings },
];

// ── Bottom 5 for mobile nav ──────────────────────────────────────────────────
const BOTTOM_NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/invoices", label: "Invoices", icon: Receipt },
];

// ── Desktop collapsible sidebar ──────────────────────────────────────────────
export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useClerk();
  const { setOpen: openSearch } = useCommandPalette();

  return (
    <div
      className={cn(
        "flex flex-col border-r border-white/10 bg-card/60 backdrop-blur-xl transition-all duration-300 h-full",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-white/10 flex-shrink-0">
        {!collapsed && (
          <span className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-wide pl-1">
            TOP TIN
          </span>
        )}
        <div className={cn("flex items-center gap-1", collapsed && "flex-col gap-0.5 mx-auto")}>
          {!collapsed && <NotificationBell />}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
          {collapsed && <NotificationBell />}
        </div>
      </div>

      {/* Search button */}
      <div className="px-3 py-2 flex-shrink-0">
        <button
          onClick={() => openSearch(true)}
          className={cn(
            "w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-muted-foreground/60 hover:text-muted-foreground bg-white/[0.04] hover:bg-white/[0.07] border border-white/5 transition-all duration-200",
            collapsed && "justify-center px-0"
          )}
          title="Search (⌘K)"
        >
          <Search className="h-3.5 w-3.5 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="text-xs flex-1 text-left">Search...</span>
              <kbd className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center rounded-xl px-3 py-2.5 transition-all duration-150 cursor-pointer group",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,240,255,0.08)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                    isActive ? "text-primary" : "group-hover:text-foreground"
                  )}
                />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium truncate">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn("flex flex-col gap-2 p-3 border-t border-white/10 flex-shrink-0", collapsed && "items-center")}>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-7 h-7",
              userButtonTrigger: cn("rounded-xl hover:bg-white/5 transition-colors", !collapsed && "w-full"),
            },
          }}
        />
        {!collapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-9 px-3"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-3 text-sm font-medium">Log out</span>
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => signOut({ redirectUrl: "/" })}
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Mobile slide-out drawer ──────────────────────────────────────────────────
export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { setOpen: openSearch } = useCommandPalette();

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "sm:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-card/95 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-white/10 flex-shrink-0">
          <span className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-wide">
            TOP TIN ROOFING
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 flex-shrink-0">
          <button
            onClick={() => { openSearch(true); onClose(); }}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-muted-foreground/70 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">Search everything...</span>
            <kbd className="ml-auto text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 flex-shrink-0">⌘K</kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                  onClick={onClose}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
            <span className="text-sm text-muted-foreground">Account</span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 px-4"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-3 text-sm font-medium">Log out</span>
          </Button>
        </div>
      </div>
    </>
  );
}

// ── Mobile bottom nav ────────────────────────────────────────────────────────
export function MobileBottomNav() {
  const [location] = useLocation();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-background/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2">
      {BOTTOM_NAV.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <div className="flex flex-col items-center gap-1 min-w-[52px] py-1 cursor-pointer">
              <div className={cn(
                "w-10 h-8 rounded-lg flex items-center justify-center transition-all duration-150",
                isActive ? "bg-primary/15" : ""
              )}>
                <item.icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors leading-none",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
