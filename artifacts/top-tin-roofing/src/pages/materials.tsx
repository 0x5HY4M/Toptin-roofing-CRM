import { useState } from "react";
import { AppShell } from "@/components/layout/shell";
import {
  useGetMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
  getGetMaterialsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Box, Trash2, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Asphalt Shingles", "Metal Roofing", "TPO", "EPDM", "Flashing", "Underlayment", "Fasteners", "Gutters", "Skylights", "Other"];

const CATEGORY_COLORS: Record<string, string> = {
  "Asphalt Shingles": "bg-orange-500/20 text-orange-400",
  "Metal Roofing": "bg-blue-500/20 text-blue-400",
  "TPO": "bg-purple-500/20 text-purple-400",
  "EPDM": "bg-secondary/20 text-secondary",
  "Flashing": "bg-yellow-500/20 text-yellow-400",
  "Underlayment": "bg-primary/10 text-primary",
  "Fasteners": "bg-muted text-muted-foreground",
  "Gutters": "bg-cyan-500/20 text-cyan-400",
};

export default function Materials() {
  const { data: materials, isLoading } = useGetMaterials();
  const createMaterial = useCreateMaterial();
  const deleteMaterial = useDeleteMaterial();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", category: "Asphalt Shingles", description: "", unit: "sq ft", pricePerUnit: "", stockQuantity: "", supplier: "", sku: "" });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleCreate() {
    if (!form.name || !form.pricePerUnit) return;
    try {
      await createMaterial.mutateAsync({
        data: {
          name: form.name,
          category: form.category,
          description: form.description || undefined,
          unit: form.unit,
          pricePerUnit: parseFloat(form.pricePerUnit),
          stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : undefined,
          supplier: form.supplier || undefined,
          sku: form.sku || undefined,
        }
      });
      qc.invalidateQueries({ queryKey: getGetMaterialsQueryKey() });
      toast.success("Material added");
      setOpen(false);
      setForm({ name: "", category: "Asphalt Shingles", description: "", unit: "sq ft", pricePerUnit: "", stockQuantity: "", supplier: "", sku: "" });
    } catch { toast.error("Failed to add material"); }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMaterial.mutateAsync({ id });
      qc.invalidateQueries({ queryKey: getGetMaterialsQueryKey() });
      toast.success("Material deleted");
    } catch { toast.error("Failed to delete material"); }
  }

  const filtered = (materials ?? []).filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    (m.supplier ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = materials?.reduce((s, m) => s + (m.pricePerUnit ?? 0) * (m.stockQuantity ?? 0), 0) ?? 0;

  return (
    <AppShell>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text mb-1">Materials</h1>
            <p className="text-muted-foreground">Manage roofing materials inventory and pricing.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30">
                <Plus className="h-4 w-4 mr-2" /> Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/10">
              <DialogHeader><DialogTitle className="text-foreground">Add Material</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="30-year architectural shingles" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Select value={form.category} onValueChange={v => set("category", v)}>
                      <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Unit</Label>
                    <Select value={form.unit} onValueChange={v => set("unit", v)}>
                      <SelectTrigger className="bg-muted/30 border-white/10 mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sq ft">sq ft</SelectItem>
                        <SelectItem value="square">square (100 sq ft)</SelectItem>
                        <SelectItem value="bundle">bundle</SelectItem>
                        <SelectItem value="roll">roll</SelectItem>
                        <SelectItem value="sheet">sheet</SelectItem>
                        <SelectItem value="linear ft">linear ft</SelectItem>
                        <SelectItem value="each">each</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Price per Unit ($)</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" type="number" value={form.pricePerUnit} onChange={e => set("pricePerUnit", e.target.value)} placeholder="0.00" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Stock Quantity</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" type="number" value={form.stockQuantity} onChange={e => set("stockQuantity", e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Supplier</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" value={form.supplier} onChange={e => set("supplier", e.target.value)} placeholder="ABC Supply Co." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">SKU</Label>
                    <Input className="bg-muted/30 border-white/10 mt-1" value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="SKU-001" />
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30" disabled={!form.name || !form.pricePerUnit}>Add Material</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="glass"><CardContent className="p-5"><p className="text-xs text-muted-foreground mb-1">Total SKUs</p><p className="text-2xl font-bold text-foreground">{materials?.length ?? 0}</p></CardContent></Card>
          <Card className="glass"><CardContent className="p-5"><p className="text-xs text-muted-foreground mb-1">Inventory Value</p><p className="text-2xl font-bold text-primary">${totalValue.toLocaleString()}</p></CardContent></Card>
          <Card className="glass"><CardContent className="p-5"><p className="text-xs text-muted-foreground mb-1">Categories</p><p className="text-2xl font-bold text-secondary">{new Set(materials?.map(m => m.category)).size}</p></CardContent></Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 bg-muted/30 border-white/10" placeholder="Search materials..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 bg-white/5 rounded-xl" />)}</div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Box className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-muted-foreground mb-1">{search ? "No results found" : "No materials yet"}</h3>
            {!search && <Button onClick={() => setOpen(true)} className="bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 mt-3"><Plus className="h-4 w-4 mr-2" />Add Material</Button>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(mat => (
              <Card key={mat.id} className="glass hover:border-primary/30 transition-colors group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{mat.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", CATEGORY_COLORS[mat.category] ?? "bg-muted text-muted-foreground")}>
                        {mat.category}
                      </span>
                      {mat.supplier && <span className="text-xs text-muted-foreground">{mat.supplier}</span>}
                      {mat.sku && <span className="text-xs text-muted-foreground/50">{mat.sku}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">${(mat.pricePerUnit ?? 0).toFixed(2)}<span className="text-xs text-muted-foreground font-normal">/{mat.unit}</span></p>
                    <p className="text-xs text-muted-foreground">{mat.stockQuantity ?? 0} in stock</p>
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 flex-shrink-0" onClick={() => handleDelete(mat.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
