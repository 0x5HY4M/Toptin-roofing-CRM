import { useState, useEffect, useRef, useCallback, createContext, useContext, useMemo } from "react";
import { useLocation } from "wouter";
import { useGetLeads, useGetCustomers, useGetProjects } from "@workspace/api-client-react";
import { Search, Users, Briefcase, LayoutDashboard, FileText, Receipt, HardHat, Calendar, CheckSquare, Box, Settings, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/useDebounce";

// ── Context ─────────────────────────────────────────────────────────────────
interface CmdCtx { open: boolean; setOpen: (v: boolean) => void }
const CommandContext = createContext<CmdCtx>({ open: false, setOpen: () => {} });
export function useCommandPalette() { return useContext(CommandContext); }

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <CommandContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandPalette />
    </CommandContext.Provider>
  );
}

// ── Quick actions ────────────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: "Navigate" },
  { label: "Leads Pipeline", href: "/leads", icon: Users, group: "Navigate" },
  { label: "Customers", href: "/customers", icon: Users, group: "Navigate" },
  { label: "Projects", href: "/projects", icon: Briefcase, group: "Navigate" },
  { label: "Estimates", href: "/estimates", icon: FileText, group: "Navigate" },
  { label: "Invoices", href: "/invoices", icon: Receipt, group: "Navigate" },
  { label: "Crew", href: "/crew", icon: HardHat, group: "Navigate" },
  { label: "Schedule", href: "/schedule", icon: Calendar, group: "Navigate" },
  { label: "Tasks", href: "/tasks", icon: CheckSquare, group: "Navigate" },
  { label: "Materials", href: "/materials", icon: Box, group: "Navigate" },
  { label: "Settings", href: "/settings", icon: Settings, group: "Navigate" },
];

interface ResultItem {
  id: string;
  label: string;
  sub?: string;
  href: string;
  icon: React.ElementType;
  group: string;
}

// ── Palette UI ───────────────────────────────────────────────────────────────
function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();
  const debouncedQuery = useDebounce(query, 200);

  const { data: leads } = useGetLeads(
    { search: debouncedQuery } as any,
    { query: { enabled: open && debouncedQuery.length >= 2 } }
  );
  const { data: customers } = useGetCustomers(
    { search: debouncedQuery } as any,
    { query: { enabled: open && debouncedQuery.length >= 2 } }
  );
  const { data: projects } = useGetProjects(
    { search: debouncedQuery } as any,
    { query: { enabled: open && debouncedQuery.length >= 2 } }
  );

  const results = useMemo<ResultItem[]>(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      return QUICK_ACTIONS.map(a => ({ ...a, id: `nav-${a.href}` }));
    }
    const q = debouncedQuery.toLowerCase();
    const items: ResultItem[] = [];

    // Filter quick actions by label
    QUICK_ACTIONS.forEach(a => {
      if (a.label.toLowerCase().includes(q)) {
        items.push({ ...a, id: `nav-${a.href}` });
      }
    });

    (leads ?? []).slice(0, 4).forEach(l => {
      items.push({
        id: `lead-${l.id}`,
        label: l.name,
        sub: `Lead · ${l.stage} · ${l.roofType ?? ""}`,
        href: "/leads",
        icon: Users,
        group: "Leads",
      });
    });

    (customers ?? []).slice(0, 4).forEach(c => {
      items.push({
        id: `customer-${c.id}`,
        label: c.name,
        sub: `Customer · ${c.city ?? c.email}`,
        href: "/customers",
        icon: Users,
        group: "Customers",
      });
    });

    (projects ?? []).slice(0, 4).forEach(p => {
      items.push({
        id: `project-${p.id}`,
        label: p.name,
        sub: `Project · ${p.status} · ${p.roofType}`,
        href: "/projects",
        icon: Briefcase,
        group: "Projects",
      });
    });

    return items;
  }, [debouncedQuery, leads, customers, projects]);

  // Group results
  const grouped = useMemo(() => {
    const map: Record<string, ResultItem[]> = {};
    results.forEach(r => {
      if (!map[r.group]) map[r.group] = [];
      map[r.group].push(r);
    });
    return map;
  }, [results]);

  // Flat list for keyboard nav
  const flat = results;

  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const navigate = useCallback((item: ResultItem) => {
    setLocation(item.href);
    setOpen(false);
  }, [setLocation, setOpen]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && flat[activeIdx]) { navigate(flat[activeIdx]); }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, flat, activeIdx, navigate, setOpen]);

  if (!open) return null;

  let flatIdx = 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-card/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.08)] overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10">
          <Search className="h-4 w-4 text-primary flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search leads, customers, projects..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm outline-none"
          />
          {query ? (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="text-xs text-muted-foreground/40 bg-muted/30 px-1.5 py-0.5 rounded border border-white/5 flex-shrink-0">ESC</span>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <div className="px-4 py-1.5">
                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground/50 uppercase">{group}</span>
              </div>
              {items.map(item => {
                const idx = flatIdx++;
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={item.id}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      isActive ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => navigate(item)}
                  >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", isActive ? "bg-primary/20" : "bg-white/5")}>
                      <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium truncate", isActive ? "text-foreground" : "")}>{item.label}</p>
                      {item.sub && <p className="text-xs text-muted-foreground/60 truncate">{item.sub}</p>}
                    </div>
                    {isActive && <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}

          {flat.length === 0 && (
            <div className="text-center py-10 text-sm text-muted-foreground/50">No results for "{query}"</div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 border-t border-white/5 flex items-center gap-4 text-[10px] text-muted-foreground/40">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span><kbd className="font-mono">⌘K</kbd> toggle</span>
        </div>
      </div>
    </div>
  );
}
