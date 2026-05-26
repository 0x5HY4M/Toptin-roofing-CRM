import { useState } from "react";
import { AppShell } from "@/components/layout/shell";
import {
  useGetEvents,
  useGetProjects,
  useGetCrewMembers,
  useGetCustomers,
  useCreateEvent,
  useDeleteEvent,
  getGetEventsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, ChevronLeft, ChevronRight, Trash2, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EVENT_COLORS: Record<string, string> = {
  inspection: "bg-primary/20 text-primary border-primary/30",
  meeting: "bg-secondary/20 text-secondary border-secondary/30",
  project_start: "bg-accent/20 text-accent-foreground border-accent/30",
  project_end: "bg-destructive/20 text-destructive border-destructive/30",
  other: "bg-muted/50 text-muted-foreground border-white/10",
};

export default function Schedule() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "meeting", startTime: "", endTime: "", projectId: "", crewId: "", location: "" });

  const { data: events, isLoading } = useGetEvents();
  const { data: projects } = useGetProjects();
  const { data: crew } = useGetCrewMembers();
  const createEvent = useCreateEvent();
  const deleteEvent = useDeleteEvent();
  const qc = useQueryClient();

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start on Monday
  const startDay = (monthStart.getDay() + 6) % 7;

  async function handleCreate() {
    if (!form.title || !form.startTime || !form.endTime) return;
    try {
      await createEvent.mutateAsync({
        data: {
          title: form.title,
          type: form.type,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
          projectId: form.projectId ? parseInt(form.projectId) : undefined,
          crewId: form.crewId ? parseInt(form.crewId) : undefined,
          location: form.location || undefined,
          status: "scheduled",
        }
      });
      qc.invalidateQueries({ queryKey: getGetEventsQueryKey() });
      toast.success("Event created");
      setOpen(false);
      setForm({ title: "", type: "meeting", startTime: "", endTime: "", projectId: "", crewId: "", location: "" });
    } catch { toast.error("Failed to create event"); }
  }

  async function handleDelete(id: number) {
    try {
      await deleteEvent.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getGetEventsQueryKey() });
      toast.success("Event deleted");
    } catch { toast.error("Failed to delete event"); }
  }

  function eventsOnDay(day: Date) {
    return (events ?? []).filter(e => isSameDay(new Date(e.startTime), day));
  }

  return (
    <AppShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text mb-1">Schedule</h1>
            <p className="text-muted-foreground">Calendar of inspections, meetings, and project milestones.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10">
              <DialogHeader><DialogTitle className="text-foreground">Create Event</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <Input className="bg-muted/30 border-white/10 mt-1" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Roof inspection at..." />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Select value={form.type} onValueChange={v => set("type", v)}>
                    <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="project_start">Project Start</SelectItem>
                      <SelectItem value="project_end">Project End</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Time</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" type="datetime-local" value={form.startTime} onChange={e => set("startTime", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End Time</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" type="datetime-local" value={form.endTime} onChange={e => set("endTime", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Project (optional)</Label>
                  <Select value={form.projectId} onValueChange={v => set("projectId", v)}>
                    <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {projects?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Crew Member (optional)</Label>
                  <Select value={form.crewId} onValueChange={v => set("crewId", v)}>
                    <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {crew?.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Location</Label>
                  <Input className="bg-muted/30 border-white/10 mt-1" value={form.location} onChange={e => set("location", e.target.value)} placeholder="Address or description..." />
                </div>
                <Button onClick={handleCreate} className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30" disabled={!form.title || !form.startTime || !form.endTime}>Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">{format(currentMonth, "MMMM yyyy")}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 mb-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground py-2 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {[...Array(startDay)].map((_, i) => <div key={`pad-${i}`} />)}
              {days.map(day => {
                const dayEvents = eventsOnDay(day);
                const isToday = isSameDay(day, new Date());
                return (
                  <div key={day.toString()} className={cn("min-h-[80px] rounded-xl p-1.5 transition-colors", isToday ? "bg-primary/10 border border-primary/20" : "hover:bg-white/3 border border-transparent")}>
                    <div className={cn("text-xs font-medium mb-1", isToday ? "text-primary" : isSameMonth(day, currentMonth) ? "text-foreground" : "text-muted-foreground/30")}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(ev => (
                        <div key={ev.id} className={cn("px-1 py-0.5 rounded text-[10px] truncate border", EVENT_COLORS[ev.type] ?? EVENT_COLORS.other)}>
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <div className="text-[10px] text-muted-foreground pl-1">+{dayEvents.length - 3} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming Events</h2>
          {isLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 bg-white/5 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-2">
              {(events ?? []).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .filter(e => new Date(e.startTime) >= new Date())
                .slice(0, 10)
                .map(ev => (
                  <Card key={ev.id} className="glass hover:border-primary/30 transition-colors group">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-8 rounded-full", EVENT_COLORS[ev.type]?.split(" ")[0] ?? "bg-muted")} />
                        <div>
                          <p className="font-medium text-sm text-foreground">{ev.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(ev.startTime), "MMM d, yyyy 'at' h:mm a")}
                            {ev.location && ` · ${ev.location}`}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(ev.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              {!(events ?? []).filter(e => new Date(e.startTime) >= new Date()).length && (
                <div className="text-center py-12 text-muted-foreground/50 text-sm">No upcoming events</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
