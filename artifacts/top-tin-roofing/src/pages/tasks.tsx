import { useState } from "react";
import { AppShell } from "@/components/layout/shell";
import {
  useGetTasks,
  useGetProjects,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  getGetTasksQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, CheckSquare, Trash2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  low: "bg-muted/50 text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-yellow-500/20 text-yellow-400",
  urgent: "bg-destructive/20 text-destructive",
};

export default function Tasks() {
  const { data: tasks, isLoading } = useGetTasks();
  const { data: projects } = useGetProjects();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", projectId: "", assignedTo: "", dueDate: "" });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleCreate() {
    if (!form.title) return;
    try {
      await createTask.mutateAsync({
        data: {
          title: form.title,
          description: form.description || undefined,
          priority: form.priority,
          status: "todo",
          projectId: form.projectId ? parseInt(form.projectId) : undefined,
          assignedTo: form.assignedTo || undefined,
          dueDate: form.dueDate || undefined,
        }
      });
      qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
      toast.success("Task created");
      setOpen(false);
      setForm({ title: "", description: "", priority: "medium", projectId: "", assignedTo: "", dueDate: "" });
    } catch { toast.error("Failed to create task"); }
  }

  async function handleToggle(id: number, currentStatus: string) {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    try {
      await updateTask.mutateAsync({ id, data: { status: newStatus, completedAt: newStatus === "done" ? new Date().toISOString() : null } });
      qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
    } catch { toast.error("Failed to update task"); }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTask.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getGetTasksQueryKey() });
      toast.success("Task deleted");
    } catch { toast.error("Failed to delete task"); }
  }

  const filtered = (tasks ?? []).filter(t => filter === "all" || t.status === filter);
  const counts = {
    all: tasks?.length ?? 0,
    todo: tasks?.filter(t => t.status === "todo").length ?? 0,
    in_progress: tasks?.filter(t => t.status === "in_progress").length ?? 0,
    done: tasks?.filter(t => t.status === "done").length ?? 0,
  };

  return (
    <AppShell>
      <div className="flex flex-col space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground glow-text">Tasks</h1>
            <p className="text-sm text-muted-foreground">Track work items and action items across projects.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 self-start sm:self-auto">
                <Plus className="h-4 w-4 mr-2" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10">
              <DialogHeader><DialogTitle className="text-foreground">Create Task</DialogTitle></DialogHeader>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <Input className="bg-muted/30 border-white/10 mt-1" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Task title..." />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Input className="bg-muted/30 border-white/10 mt-1" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Optional description..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Priority</Label>
                    <Select value={form.priority} onValueChange={v => set("priority", v)}>
                      <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Due Date</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Project (optional)</Label>
                    <Select value={form.projectId} onValueChange={v => set("projectId", v)}>
                      <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {projects?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Assigned To</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" value={form.assignedTo} onChange={e => set("assignedTo", e.target.value)} placeholder="Name..." />
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30" disabled={!form.title}>Create Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter pills — horizontal scroll on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(["all", "todo", "in_progress", "done"] as const).map(f => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              className={cn(
                "text-xs flex-shrink-0",
                filter === f
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "in_progress" ? "In Progress" : f === "todo" ? "To Do" : "Done"}
              <span className="ml-1.5 opacity-60">({counts[f]})</span>
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 bg-white/5 rounded-xl" />)}</div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckSquare className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-muted-foreground mb-1">No tasks {filter !== "all" ? `with status "${filter}"` : "yet"}</h3>
            {filter === "all" && <Button onClick={() => setOpen(true)} className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 mt-3"><Plus className="h-4 w-4 mr-2" />Create Task</Button>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(task => (
              <Card key={task.id} className={cn("glass hover:border-primary/30 transition-colors", task.status === "done" && "opacity-50")}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.status === "done"}
                      onCheckedChange={() => handleToggle(task.id, task.status)}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium text-foreground", task.status === "done" && "line-through text-muted-foreground")}>{task.title}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                        {task.projectName && <span className="truncate max-w-[120px]">{task.projectName}</span>}
                        {task.assignedTo && <span className="truncate">{task.assignedTo}</span>}
                        {task.dueDate && (
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <CalendarDays className="h-3 w-3" />
                            {format(new Date(task.dueDate), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", PRIORITY_STYLES[task.priority] ?? "bg-muted text-muted-foreground")}>
                        {task.priority}
                      </span>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
