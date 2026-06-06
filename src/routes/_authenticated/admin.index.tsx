import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStats } from "@/lib/admin.functions";
import { Card } from "@/components/ui/card";
import { Crown, Users, Store, Package, ShoppingBag, ShieldAlert, TrendingUp, Repeat } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Overview });

const fmtNGN = (n: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function Overview() {
  const fetchStats = useServerFn(getAdminStats);
  const [s, setS] = useState<any>(null);
  useEffect(() => { fetchStats().then(setS); }, []);

  const tiles = s ? [
    { label: "Users", value: s.userCount, icon: Users },
    { label: "Vendors", value: s.storeCount, icon: Store },
    { label: "Products", value: s.productCount, icon: Package },
    { label: "Orders", value: s.orderCount, icon: ShoppingBag },
    { label: "Pending KYC", value: s.pendingKyc, icon: ShieldAlert, accent: s.pendingKyc > 0 },
    { label: "Active subs", value: s.activeSubs, icon: Repeat },
    { label: "GMV", value: fmtNGN(s.gmv), icon: TrendingUp },
    { label: "Revenue (30d)", value: fmtNGN(s.mrr30), icon: TrendingUp },
  ] : [];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex items-center gap-3">
        <Crown className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl font-bold">Platform overview</h1>
          <p className="text-sm text-muted-foreground">Real-time KPIs across the entire app.</p>
        </div>
      </div>
      {!s ? <p className="text-sm text-muted-foreground">Loading…</p> : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {tiles.map((t) => (
              <Card key={t.label} className={`p-4 ${t.accent ? "border-warning/40 bg-warning/5" : ""}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t.label}</p>
                  <t.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 font-display text-2xl font-bold">{t.value}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-6 p-4">
            <h2 className="mb-3 font-semibold">Recent orders</h2>
            {s.recentOrders.length === 0 ? <p className="text-sm text-muted-foreground">No orders yet.</p> : (
              <div className="divide-y divide-border/50">
                {s.recentOrders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="font-medium">{o.buyer_name}</span>
                    <span className="text-muted-foreground">{o.status}</span>
                    <span className="font-mono">{fmtNGN(Number(o.total))}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
