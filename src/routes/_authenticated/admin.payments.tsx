import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllPayments } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/payments")({ component: PaymentsPage });

const fmt = (n: number, c: string) => new Intl.NumberFormat("en-NG", { style: "currency", currency: c || "NGN", maximumFractionDigits: 0 }).format(n);

function PaymentsPage() {
  const fetchAll = useServerFn(listAllPayments);
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetchAll().then(setRows); }, []);
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-1 font-display text-3xl font-bold">Payments</h1>
      <p className="mb-6 text-sm text-muted-foreground">{rows.length} transactions</p>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-2">Reference</th><th className="px-4 py-2">Provider</th><th className="px-4 py-2">Store</th><th className="px-4 py-2">Buyer</th><th className="px-4 py-2">Status</th><th className="px-4 py-2 text-right">Amount</th><th className="px-4 py-2">Date</th></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs">{p.reference || p.id.slice(0, 8)}</td>
                <td className="px-4 py-3">{p.provider}</td>
                <td className="px-4 py-3">{p.orders?.stores?.name || "—"}</td>
                <td className="px-4 py-3">{p.orders?.buyer_name || "—"}</td>
                <td className="px-4 py-3"><Badge variant={p.status === "succeeded" ? "default" : "secondary"}>{p.status}</Badge></td>
                <td className="px-4 py-3 text-right font-mono">{fmt(Number(p.amount), "NGN")}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
