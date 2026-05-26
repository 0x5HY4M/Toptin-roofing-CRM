import { useState } from "react";
import { AppShell } from "@/components/layout/shell";
import {
  useGetEstimates,
  useGetCustomers,
  useCreateEstimate,
  useDeleteEstimate,
  getGetEstimatesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Trash2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/20 text-primary",
  approved: "bg-secondary/20 text-secondary",
  rejected: "bg-destructive/20 text-destructive",
};

function EstimateCalculator({ onSubmit, customers }: any) {
  const [form, setForm] = useState({
    customerId: "",
    roofType: "Asphalt Shingles",
    squareFootage: "",
    materialCost: "",
    laborCost: "",
    taxRate: "8.25",
    discountAmount: "0",
    notes: "",
    validUntil: "",
    status: "draft",
  });

  const sqft = parseFloat(form.squareFootage) || 0;
  const mat = parseFloat(form.materialCost) || 0;
  const labor = parseFloat(form.laborCost) || 0;
  const tax = parseFloat(form.taxRate) || 0;
  const discount = parseFloat(form.discountAmount) || 0;
  const subtotal = mat + labor;
  const taxAmt = subtotal * (tax / 100);
  const total = subtotal + taxAmt - discount;

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Customer</Label>
          <Select value={form.customerId} onValueChange={v => set("customerId", v)}>
            <SelectTrigger className="bg-muted/30 border-white/10 mt-1">
              <SelectValue placeholder="Select customer..." />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((c: any) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Roof Type</Label>
          <Select value={form.roofType} onValueChange={v => set("roofType", v)}>
            <SelectTrigger className="bg-muted/30 border-white/10 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["Asphalt Shingles","Metal Roofing","TPO","EPDM","Tile","Flat"].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Sq Footage</Label>
          <Input className="bg-muted/30 border-white/10 mt-1" type="number" value={form.squareFootage} onChange={e => set("squareFootage", e.target.value)} placeholder="2400" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Material ($)</Label>
          <Input className="bg-muted/30 border-white/10 mt-1" type="number" value={form.materialCost} onChange={e => set("materialCost", e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Labor ($)</Label>
          <Input className="bg-muted/30 border-white/10 mt-1" type="number" value={form.laborCost} onChange={e => set("laborCost", e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Tax Rate (%)</Label>
          <Input className="bg-muted/30 border-white/10 mt-1" type="number" value={form.taxRate} onChange={e => set("taxRate", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Discount ($)</Label>
          <Input className="bg-muted/30 border-white/10 mt-1" type="number" value={form.discountAmount} onChange={e => set("discountAmount", e.target.value)} />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Valid Until</Label>
          <Input className="bg-muted/30 border-white/10 mt-1" type="date" value={form.validUntil} onChange={e => set("validUntil", e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Input className="bg-muted/30 border-white/10 mt-1" value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Optional notes..." />
        </div>
      </div>

      <div className="rounded-xl bg-muted/20 border border-white/5 p-4 space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span><span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax ({tax}%)</span><span>${taxAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Discount</span><span>-${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between font-bold text-foreground border-t border-white/10 pt-2">
          <span>Total</span>
          <span className="text-primary glow-text">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <Button
        className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30"
        onClick={() => onSubmit({ ...form, customerId: parseInt(form.customerId), totalAmount: total, squareFootage: sqft || undefined, materialCost: mat || undefined, laborCost: labor || undefined, taxRate: tax, discountAmount: discount })}
        disabled={!form.customerId}
      >
        Create Estimate
      </Button>
    </div>
  );
}

export default function Estimates() {
  const { data: estimates, isLoading } = useGetEstimates();
  const { data: customers } = useGetCustomers();
  const createEstimate = useCreateEstimate();
  const deleteEstimate = useDeleteEstimate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  async function handleCreate(data: any) {
    try {
      await createEstimate.mutateAsync({ data });
      qc.invalidateQueries({ queryKey: getGetEstimatesQueryKey() });
      toast.success("Estimate created");
      setOpen(false);
    } catch {
      toast.error("Failed to create estimate");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteEstimate.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getGetEstimatesQueryKey() });
      toast.success("Estimate deleted");
    } catch {
      toast.error("Failed to delete estimate");
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground glow-text">Estimates</h1>
            <p className="text-sm text-muted-foreground">Create and manage project estimates.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 self-start sm:self-auto">
                <Plus className="h-4 w-4 mr-2" /> New Estimate
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create Estimate</DialogTitle>
              </DialogHeader>
              <EstimateCalculator onSubmit={handleCreate} customers={customers} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-xl" />)}
          </div>
        ) : !estimates?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-muted-foreground mb-1">No estimates yet</h3>
            <p className="text-sm text-muted-foreground/60 mb-4">Create your first estimate to get started.</p>
            <Button onClick={() => setOpen(true)} className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">
              <Plus className="h-4 w-4 mr-2" /> Create Estimate
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {estimates.map(est => (
              <Card key={est.id} className="glass hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{est.customerName ?? `Customer #${est.customerId}`}</p>
                          <p className="text-xs text-muted-foreground truncate">{est.roofType} {est.squareFootage ? `· ${est.squareFootage.toLocaleString()} sq ft` : ""}</p>
                        </div>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0", STATUS_COLORS[est.status] ?? "bg-muted text-muted-foreground")}>
                          {est.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {est.validUntil ? (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3 w-3" />
                            {format(new Date(est.validUntil), "MMM d, yyyy")}
                          </div>
                        ) : <div />}
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-primary">${(est.totalAmount ?? 0).toLocaleString()}</span>
                          <button
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => handleDelete(est.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
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
