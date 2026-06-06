import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllOrders } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/orders")({ component: OrdersPage });

const fmt = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function OrdersPage() {
  const fetchOrders = useServerFn(listAllOrders);
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { fetchOrders().then(setRows); }, []);
  const filtered = rows.filter((r) => !q || (r.buyer_name || "").toLowerCase().includes(q.toLowerCase()) || (r.stores?.name || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">All orders</h1>
          <p className="text-sm text-muted-foreground">{rows.length} (last 500)</p>
        </div>
        <Input placeholder="Search buyer or store" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-2">Buyer</th><th className="px-4 py-2">Store</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Total</th><th className="px-4 py-2">Date</th></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filtered.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3">{o.buyer_name}<div className="text-xs text-muted-foreground">{o.buyer_phone}</div></td>
                <td className="px-4 py-3">{o.stores?.name || "—"}</td>
                <td className="px-4 py-3"><Badge variant={o.status === "delivered" ? "default" : "secondary"}>{o.status}</Badge></td>
                <td className="px-4 py-3 text-right font-mono">{fmt(Number(o.total))}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
