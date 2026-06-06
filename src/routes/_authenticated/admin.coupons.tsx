import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listCoupons, upsertCoupon } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Tag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/coupons")({ component: CouponsPage });

function CouponsPage() {
  const fetchAll = useServerFn(listCoupons);
  const save = useServerFn(upsertCoupon);
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);
  const load = () => fetchAll().then(setRows);
  useEffect(() => { load(); }, []);

  async function submit() {
    try {
      await save({ data: {
        ...editing,
        code: editing.code.toUpperCase(),
        percent_off: editing.percent_off ? Number(editing.percent_off) : null,
        amount_off: editing.amount_off ? Number(editing.amount_off) : null,
        max_redemptions: editing.max_redemptions ? Number(editing.max_redemptions) : null,
        expires_at: editing.expires_at || null,
      }});
      toast.success("Coupon saved"); setOpen(false); load();
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Tag className="h-6 w-6" />Coupons</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={() => { setEditing({ code: "", is_active: true }); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />New coupon</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing?.id ? "Edit coupon" : "New coupon"}</DialogTitle></DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div><Label>Code</Label><Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} /></div>
                <div><Label>Description</Label><Input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>% off</Label><Input type="number" value={editing.percent_off ?? ""} onChange={(e) => setEditing({ ...editing, percent_off: e.target.value, amount_off: "" })} /></div>
                  <div><Label>₦ off</Label><Input type="number" value={editing.amount_off ?? ""} onChange={(e) => setEditing({ ...editing, amount_off: e.target.value, percent_off: "" })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Max redemptions</Label><Input type="number" value={editing.max_redemptions ?? ""} onChange={(e) => setEditing({ ...editing, max_redemptions: e.target.value })} /></div>
                  <div><Label>Expires</Label><Input type="date" value={editing.expires_at?.slice(0,10) ?? ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} /></div>
                </div>
                <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /></div>
                <Button className="w-full" onClick={submit}>Save</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-2">Code</th><th className="px-4 py-2">Discount</th><th className="px-4 py-2">Used</th><th className="px-4 py-2">Expires</th><th className="px-4 py-2">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No coupons yet.</td></tr> : rows.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-accent/30" onClick={() => { setEditing(c); setOpen(true); }}>
                <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                <td className="px-4 py-3">{c.percent_off ? `${c.percent_off}%` : `₦${Number(c.amount_off).toLocaleString()}`}</td>
                <td className="px-4 py-3">{c.times_redeemed}{c.max_redemptions ? `/${c.max_redemptions}` : ""}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">{c.is_active ? <Badge>active</Badge> : <Badge variant="outline">off</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
