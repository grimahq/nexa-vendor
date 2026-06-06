import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listAllSubscriptions } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/subscriptions")({ component: SubsPage });

function SubsPage() {
  const fetchSubs = useServerFn(listAllSubscriptions);
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { fetchSubs().then(setRows); }, []);
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-1 font-display text-3xl font-bold">Subscriptions</h1>
      <p className="mb-6 text-sm text-muted-foreground">{rows.length} subscriptions · Stripe billing not yet enabled — manage manually for now.</p>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr><th className="px-4 py-2">Store</th><th className="px-4 py-2">Plan</th><th className="px-4 py-2">Cycle</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Renews</th></tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No subscriptions yet.</td></tr>
            ) : rows.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">{s.stores?.name}</td>
                <td className="px-4 py-3">{s.subscription_plans?.name}</td>
                <td className="px-4 py-3">{s.billing_cycle}</td>
                <td className="px-4 py-3"><Badge>{s.status}</Badge></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
