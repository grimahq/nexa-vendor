import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listPlans, upsertPlan } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/plans")({ component: PlansPage });

function PlansPage() {
  const fetchPlans = useServerFn(listPlans);
  const save = useServerFn(upsertPlan);
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const load = () => fetchPlans().then(setRows);
  useEffect(() => { load(); }, []);

  function openNew() { setEditing({ name: "", slug: "", price_monthly: 0, price_yearly: 0, currency: "NGN", features: [], commission_pct: 0, is_active: true, sort_order: 0 }); setOpen(true); }
  function openEdit(p: any) { setEditing({ ...p, features: Array.isArray(p.features) ? p.features : [] }); setOpen(true); }

  async function submit() {
    try {
      await save({ data: {
        ...editing,
        price_monthly: Number(editing.price_monthly),
        price_yearly: Number(editing.price_yearly),
        commission_pct: Number(editing.commission_pct),
        max_products: editing.max_products ? Number(editing.max_products) : null,
        sort_order: Number(editing.sort_order),
        features: typeof editing.features === "string" ? editing.features.split("\n").map((s: string) => s.trim()).filter(Boolean) : editing.features,
      }});
      toast.success("Plan saved");
      setOpen(false); load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Subscription plans</h1>
          <p className="text-sm text-muted-foreground">{rows.length} plans</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />New plan</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing?.id ? "Edit plan" : "New plan"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                  <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase() })} /></div>
                  <div><Label>Monthly (₦)</Label><Input type="number" value={editing.price_monthly} onChange={(e) => setEditing({ ...editing, price_monthly: e.target.value })} /></div>
                  <div><Label>Yearly (₦)</Label><Input type="number" value={editing.price_yearly} onChange={(e) => setEditing({ ...editing, price_yearly: e.target.value })} /></div>
                  <div><Label>Commission %</Label><Input type="number" value={editing.commission_pct} onChange={(e) => setEditing({ ...editing, commission_pct: e.target.value })} /></div>
                  <div><Label>Max products</Label><Input type="number" value={editing.max_products ?? ""} onChange={(e) => setEditing({ ...editing, max_products: e.target.value })} placeholder="∞" /></div>
                </div>
                <div><Label>Description</Label><Input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                <div>
                  <Label>Features (one per line)</Label>
                  <Textarea rows={4} value={Array.isArray(editing.features) ? editing.features.join("\n") : editing.features} onChange={(e) => setEditing({ ...editing, features: e.target.value })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                </div>
                <Button className="w-full" onClick={submit}>Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {rows.map((p) => (
          <Card key={p.id} className="cursor-pointer p-5" onClick={() => openEdit(p)}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">{p.name}</h3>
              {p.is_active ? <Badge>active</Badge> : <Badge variant="outline">hidden</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
            <p className="mt-3 font-display text-3xl font-bold">₦{Number(p.price_monthly).toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            <p className="text-xs text-muted-foreground">{p.commission_pct}% commission · {p.max_products ?? "∞"} products</p>
            <ul className="mt-3 space-y-1 text-sm">
              {(p.features || []).map((f: string, i: number) => <li key={i}>· {f}</li>)}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
