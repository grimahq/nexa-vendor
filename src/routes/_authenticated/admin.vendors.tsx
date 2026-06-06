import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllVendors, updateStoreFlags } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Star, Shield, Ban } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/vendors")({ component: VendorsPage });

function VendorsPage() {
  const fetchVendors = useServerFn(listAllVendors);
  const update = useServerFn(updateStoreFlags);
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");

  const load = () => fetchVendors().then(setRows);
  useEffect(() => { load(); }, []);

  const filtered = rows.filter(r => !q || (r.name || "").toLowerCase().includes(q.toLowerCase()) || (r.slug || "").includes(q.toLowerCase()));

  async function toggle(storeId: string, patch: any, msg: string) {
    await update({ data: { storeId, ...patch } });
    toast.success(msg);
    load();
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Vendors</h1>
          <p className="text-sm text-muted-foreground">{rows.length} stores</p>
        </div>
        <Input placeholder="Search store" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <div className="grid gap-3">
        {filtered.map((s) => (
          <Card key={s.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{s.name}</h3>
                {s.verified && <Badge className="bg-success">verified</Badge>}
                {s.featured && <Badge className="bg-primary">featured</Badge>}
                {s.suspended && <Badge variant="destructive">suspended</Badge>}
                <Badge variant="outline">{s.kyc_status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">/{s.slug} · {s.category || "—"}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => toggle(s.id, { verified: !s.verified }, "Updated")}><Shield className="mr-1 h-3.5 w-3.5" />{s.verified ? "Unverify" : "Verify"}</Button>
              <Button size="sm" variant="outline" onClick={() => toggle(s.id, { featured: !s.featured }, "Updated")}><Star className="mr-1 h-3.5 w-3.5" />{s.featured ? "Unfeature" : "Feature"}</Button>
              <Button size="sm" variant={s.suspended ? "outline" : "destructive"} onClick={() => toggle(s.id, { suspended: !s.suspended }, "Updated")}><Ban className="mr-1 h-3.5 w-3.5" />{s.suspended ? "Unsuspend" : "Suspend"}</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
