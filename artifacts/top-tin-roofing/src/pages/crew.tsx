import { useState } from "react";
import { AppShell } from "@/components/layout/shell";
import {
  useGetCrewMembers,
  useCreateCrewMember,
  useUpdateCrewMember,
  useDeleteCrewMember,
  getGetCrewMembersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, HardHat, Trash2, Phone, Mail, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-secondary/20 text-secondary",
  inactive: "bg-muted text-muted-foreground",
  on_leave: "bg-yellow-500/20 text-yellow-400",
};

const ROLES = ["Lead Foreman", "Foreman", "Roofer", "Estimator", "Project Manager", "Apprentice", "Inspector"];

export default function Crew() {
  const { data: crew, isLoading } = useGetCrewMembers();
  const createCrew = useCreateCrewMember();
  const deleteCrew = useDeleteCrewMember();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Roofer", phone: "", email: "", status: "active", specialties: "", hourlyRate: "" });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleCreate() {
    if (!form.name || !form.phone) return;
    try {
      await createCrew.mutateAsync({
        data: {
          name: form.name,
          role: form.role,
          phone: form.phone,
          email: form.email || undefined,
          status: form.status,
          specialties: form.specialties || undefined,
          hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
        }
      });
      qc.invalidateQueries({ queryKey: getGetCrewMembersQueryKey() });
      toast.success("Crew member added");
      setOpen(false);
      setForm({ name: "", role: "Roofer", phone: "", email: "", status: "active", specialties: "", hourlyRate: "" });
    } catch { toast.error("Failed to add crew member"); }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCrew.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getGetCrewMembersQueryKey() });
      toast.success("Crew member removed");
    } catch { toast.error("Failed to remove crew member"); }
  }

  return (
    <AppShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text mb-1">Crew</h1>
            <p className="text-muted-foreground">Manage your roofing team.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">
                <Plus className="h-4 w-4 mr-2" /> Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10">
              <DialogHeader>
                <DialogTitle className="text-foreground">Add Crew Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Full Name</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Smith" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Role</Label>
                    <Select value={form.role} onValueChange={v => set("role", v)}>
                      <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select value={form.status} onValueChange={v => set("status", v)}>
                      <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(512) 555-0100" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Hourly Rate ($)</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" type="number" value={form.hourlyRate} onChange={e => set("hourlyRate", e.target.value)} placeholder="35.00" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" value={form.email} onChange={e => set("email", e.target.value)} placeholder="john@company.com" />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Specialties</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" value={form.specialties} onChange={e => set("specialties", e.target.value)} placeholder="Metal Roofing, TPO..." />
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30" disabled={!form.name || !form.phone}>Add Crew Member</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 bg-white/5 rounded-xl" />)}
          </div>
        ) : !crew?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <HardHat className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-muted-foreground mb-1">No crew members yet</h3>
            <Button onClick={() => setOpen(true)} className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 mt-3"><Plus className="h-4 w-4 mr-2" />Add Member</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {crew.map(member => (
              <Card key={member.id} className="glass hover:border-primary/30 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-bold text-foreground">
                      {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_STYLES[member.status] ?? "bg-muted text-muted-foreground")}>
                        {member.status.replace("_", " ")}
                      </span>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(member.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-0.5">{member.name}</h3>
                  <p className="text-xs text-primary mb-3">{member.role}</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />{member.phone}
                    </div>
                    {member.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />{member.email}
                      </div>
                    )}
                    {member.hourlyRate && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Star className="h-3 w-3 text-yellow-400" />${member.hourlyRate}/hr
                      </div>
                    )}
                  </div>
                  {member.specialties && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {member.specialties.split(",").map(s => (
                        <span key={s} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-muted-foreground">{s.trim()}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
