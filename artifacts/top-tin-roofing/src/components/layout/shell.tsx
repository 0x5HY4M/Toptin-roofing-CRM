import { ReactNode, useState } from "react";
import { Sidebar, MobileBottomNav, MobileDrawer } from "./sidebar";
import { Search, Menu } from "lucide-react";
import { useCommandPalette } from "@/components/CommandPalette";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: ReactNode;
}

function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { setOpen } = useCommandPalette();
  return (
    <header className="sm:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-background/90 backdrop-blur-xl border-b border-white/10">
      <button
        onClick={onMenuOpen}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <span className="text-base font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-wide">
        TOP TIN
      </span>

      <button
        onClick={() => setOpen(true)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    </header>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden sm:flex flex-col flex-shrink-0 z-30 relative">
        <Sidebar />
      </div>

      {/* Mobile header */}
      <MobileHeader onMenuOpen={() => setDrawerOpen(true)} />

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Main content */}
      <main className="flex-1 overflow-auto z-10 relative pt-14 sm:pt-0 pb-20 sm:pb-0">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
