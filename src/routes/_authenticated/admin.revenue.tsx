import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getRevenueOverview } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/revenue")({ component: RevenuePage });
const fmt = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function RevenuePage() {
  const fetchRev = useServerFn(getRevenueOverview);
  const [d, setD] = useState<any>(null);
  useEffect(() => { fetchRev().then(setD); }, []);
  if (!d) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <TrendingUp className="h-7 w-7 text-primary" />
        <h1 className="font-display text-3xl font-bold">Revenue</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4"><p className="text-xs uppercase text-muted-foreground">MRR</p><p className="mt-2 font-display text-2xl font-bold">{fmt(d.mrr)}</p></Card>
        <Card className="p-4"><p className="text-xs uppercase text-muted-foreground">Commission (90d)</p><p className="mt-2 font-display text-2xl font-bold">{fmt(d.totals.commission)}</p></Card>
        <Card className="p-4"><p className="text-xs uppercase text-muted-foreground">Subs (90d)</p><p className="mt-2 font-display text-2xl font-bold">{fmt(d.totals.subscription)}</p></Card>
        <Card className="p-4"><p className="text-xs uppercase text-muted-foreground">Total (90d)</p><p className="mt-2 font-display text-2xl font-bold">{fmt(d.totals.total)}</p></Card>
      </div>
      <Card className="mt-6 p-4">
        <h2 className="mb-3 font-semibold">Daily revenue (90 days)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d.series}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => fmt(Number(v))} />
              <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {d.series.length === 0 && <p className="text-sm text-muted-foreground">No revenue recorded yet.</p>}
      </Card>
      <Card className="mt-6 p-4">
        <h2 className="mb-3 font-semibold">Recent transactions</h2>
        <div className="divide-y divide-border/50">
          {d.items.slice(0, 20).map((r: any) => (
            <div key={r.id} className="flex items-center justify-between py-2 text-sm">
              <span>{r.stores?.name || "—"}</span>
              <span className="text-xs text-muted-foreground">{r.source}</span>
              <span className="font-mono">{fmt(Number(r.amount))}</span>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
          {d.items.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
        </div>
      </Card>
    </div>
  );
}
