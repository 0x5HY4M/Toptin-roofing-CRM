import { AppShell } from "@/components/layout/shell";
import { useGetCustomers } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, Phone, Mail, MapPin } from "lucide-react";
import { useState } from "react";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useGetCustomers({ search: search || undefined } as any);

  return (
    <AppShell>
      <div className="flex flex-col space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground glow-text">Customers</h1>
            <p className="text-sm text-muted-foreground">Client directory and history.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9 bg-card/50 border-white/10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile: card list */}
        <div className="sm:hidden space-y-3">
          {isLoading
            ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-white/5" />)
            : customers?.length === 0
            ? <div className="text-center py-12 text-muted-foreground text-sm">No customers found</div>
            : customers?.map((c) => (
                <Card key={c.id} className="glass">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
                        {c.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{c.name}</p>
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 flex-shrink-0" />
                            <span>{c.phone}</span>
                          </div>
                          {c.city && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span>{c.city}{c.state ? `, ${c.state}` : ""}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block glass rounded-xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card/80">
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-primary px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-primary px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-primary px-4 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-primary px-4 py-3">Location</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="px-4 py-3"><Skeleton className="h-4 w-32 bg-white/5" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-48 bg-white/5" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-28 bg-white/5" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24 bg-white/5" /></td>
                      </tr>
                    ))
                  : customers?.length === 0
                  ? (
                      <tr>
                        <td colSpan={4} className="text-center py-10 text-muted-foreground text-sm">No customers found</td>
                      </tr>
                    )
                  : customers?.map((c) => (
                      <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer">
                        <td className="px-4 py-3 font-medium text-foreground text-sm">{c.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{c.email}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{c.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground text-sm">{c.city}{c.state ? `, ${c.state}` : ""}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
