import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
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
  ChevronRight,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
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

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useClerk();

  return (
    <div 
      className={cn(
        "flex flex-col border-r border-white/10 bg-card/60 backdrop-blur-xl transition-all duration-300 z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <span className="text-lg font-bold glow-text bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TOP TIN
          </span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-primary transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={cn(
                  "flex items-center rounded-xl px-3 py-3 transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0 transition-colors", isActive ? "text-primary glow-text" : "group-hover:text-foreground")} />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors", collapsed ? "px-0 justify-center" : "")}
          onClick={() => signOut({ redirectUrl: "/" })}
          title={collapsed ? "Log out" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="ml-3 text-sm font-medium">Log out</span>}
        </Button>
      </div>
    </div>
  );
}
