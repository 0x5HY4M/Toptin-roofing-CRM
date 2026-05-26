import { useState } from "react";
import { AppShell } from "@/components/layout/shell";
import {
  useGetInvoices,
  useGetCustomers,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
  getGetInvoicesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Receipt, Trash2, CheckCircle2 } from "lucide-react";
import { format, isPast } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function statusBadge(status: string, dueDate: string) {
  if (status === "paid") return "bg-secondary/20 text-secondary border-secondary/20";
  if (status === "pending" && dueDate && isPast(new Date(dueDate))) return "bg-destructive/20 text-destructive border-destructive/20";
  return "bg-primary/10 text-primary border-primary/20";
}
function statusLabel(status: string, dueDate: string) {
  if (status === "paid") return "Paid";
  if (status === "pending" && dueDate && isPast(new Date(dueDate))) return "Overdue";
  return "Pending";
}

export default function Invoices() {
  const { data: invoices, isLoading } = useGetInvoices();
  const { data: customers } = useGetCustomers();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customerId: "", totalAmount: "", dueDate: "", notes: "" });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleCreate() {
    if (!form.customerId || !form.totalAmount || !form.dueDate) return;
    try {
      await createInvoice.mutateAsync({
        data: {
          customerId: parseInt(form.customerId),
          totalAmount: parseFloat(form.totalAmount),
          dueDate: form.dueDate,
          notes: form.notes || undefined,
          status: "pending",
        }
      });
      qc.invalidateQueries({ queryKey: getGetInvoicesQueryKey() });
      toast.success("Invoice created");
      setOpen(false);
      setForm({ customerId: "", totalAmount: "", dueDate: "", notes: "" });
    } catch { toast.error("Failed to create invoice"); }
  }

  async function handleMarkPaid(id: number) {
    try {
      await updateInvoice.mutateAsync({ id, data: { status: "paid", paidAt: new Date().toISOString().split("T")[0] } });
      qc.invalidateQueries({ queryKey: getGetInvoicesQueryKey() });
      toast.success("Invoice marked as paid");
    } catch { toast.error("Failed to update invoice"); }
  }

  async function handleDelete(id: number) {
    try {
      await deleteInvoice.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getGetInvoicesQueryKey() });
      toast.success("Invoice deleted");
    } catch { toast.error("Failed to delete invoice"); }
  }

  const totalRevenue = invoices?.filter(i => i.status === "paid").reduce((s, i) => s + (i.totalAmount ?? 0), 0) ?? 0;
  const totalPending = invoices?.filter(i => i.status !== "paid").reduce((s, i) => s + (i.totalAmount ?? 0), 0) ?? 0;

  return (
    <AppShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text mb-1">Invoices</h1>
            <p className="text-muted-foreground">Track payments and outstanding balances.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">
                <Plus className="h-4 w-4 mr-2" /> New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Customer</Label>
                  <Select value={form.customerId} onValueChange={v => set("customerId", v)}>
                    <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{customers?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total Amount ($)</Label>
                  <Input className="bg-muted/30 border-white/10 mt-1" type="number" value={form.totalAmount} onChange={e => set("totalAmount", e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Due Date</Label>
                  <Input className="bg-muted/30 border-white/10 mt-1" type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <Input className="bg-muted/30 border-white/10 mt-1" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional..." />
                </div>
                <Button onClick={handleCreate} className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30" disabled={!form.customerId || !form.totalAmount || !form.dueDate}>Create Invoice</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Collected Revenue", value: `$${totalRevenue.toLocaleString()}`, color: "text-secondary" },
            { label: "Outstanding Balance", value: `$${totalPending.toLocaleString()}`, color: "text-primary" },
          ].map(m => (
            <Card key={m.label} className="glass">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 bg-white/5 rounded-xl" />)}</div>
        ) : !invoices?.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-muted-foreground mb-1">No invoices yet</h3>
            <Button onClick={() => setOpen(true)} className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 mt-3"><Plus className="h-4 w-4 mr-2" />Create Invoice</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map(inv => (
              <Card key={inv.id} className="glass hover:border-primary/30 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{inv.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{inv.customerName ?? `Customer #${inv.customerId}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", statusBadge(inv.status, inv.dueDate))}>
                        {statusLabel(inv.status, inv.dueDate)}
                      </span>
                      <span className="text-xs text-muted-foreground">Due {format(new Date(inv.dueDate), "MMM d, yyyy")}</span>
                      <span className="text-lg font-bold text-primary">${(inv.totalAmount ?? 0).toLocaleString()}</span>
                      {inv.status !== "paid" && (
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-secondary/70 hover:text-secondary hover:bg-secondary/10" onClick={() => handleMarkPaid(inv.id)} title="Mark as paid">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(inv.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
