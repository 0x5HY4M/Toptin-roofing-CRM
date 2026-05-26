import { AppShell } from "@/components/layout/shell";
import { useGetProjects } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-secondary/20 text-secondary border-secondary/20",
  in_progress: "bg-primary/20 text-primary border-primary/20",
  active: "bg-primary/20 text-primary border-primary/20",
  pending: "bg-muted/30 text-muted-foreground border-white/10",
  inspection: "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
  permit: "bg-orange-500/20 text-orange-400 border-orange-500/20",
};

function statusLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export default function Projects() {
  const { data: projects, isLoading } = useGetProjects();

  return (
    <AppShell>
      <div className="flex flex-col space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground glow-text">Projects</h1>
          <p className="text-sm text-muted-foreground">Active and past roofing jobs.</p>
        </div>

        {/* Mobile: card list */}
        <div className="sm:hidden space-y-3">
          {isLoading
            ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl bg-white/5" />)
            : projects?.map((p) => (
                <Card key={p.id} className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-foreground truncate text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{p.customerName} · {p.roofType}</p>
                      </div>
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border flex-shrink-0", STATUS_STYLES[p.status] ?? "bg-muted text-muted-foreground border-white/10")}>
                        {statusLabel(p.status)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 truncate">{p.address}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{p.progressPercent ?? 0}% complete</span>
                      {p.contractValue && (
                        <span className="text-sm font-bold text-primary">${(p.contractValue).toLocaleString()}</span>
                      )}
                    </div>
                    <ProgressBar value={p.progressPercent ?? 0} />
                  </CardContent>
                </Card>
              ))}
          {!isLoading && !projects?.length && (
            <div className="text-center py-12 text-muted-foreground text-sm">No projects found</div>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block glass rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card/80">
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-primary px-4 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-primary px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-primary px-4 py-3">Roof Type</th>
                  <th className="text-left text-xs font-semibold text-primary px-4 py-3">Value</th>
                  <th className="text-left text-xs font-semibold text-primary px-4 py-3 w-44">Progress</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-36 bg-white/5" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-24 rounded-full bg-white/5" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-28 bg-white/5" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20 bg-white/5" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-2 w-full bg-white/5 rounded-full" /></td>
                      </tr>
                    ))
                  : projects?.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground text-sm">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.customerName}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", STATUS_STYLES[p.status] ?? "bg-muted text-muted-foreground border-white/10")}>
                            {statusLabel(p.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{p.roofType}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-primary">
                          {p.contractValue ? `$${p.contractValue.toLocaleString()}` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ProgressBar value={p.progressPercent ?? 0} />
                            <span className="text-xs text-muted-foreground w-8 text-right">{p.progressPercent ?? 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                {!isLoading && !projects?.length && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">No projects found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
