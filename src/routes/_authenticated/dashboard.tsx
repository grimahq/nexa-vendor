import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Package, ShoppingCart, Eye, ExternalLink, Copy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Nexa Vendors" }] }),
  component: Dashboard,
});

type Store = { id: string; name: string; slug: string; verified: boolean; brand_color: string | null };

function Dashboard() {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, views: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: s } = await supabase.from("stores").select("id,name,slug,verified,brand_color").eq("owner_id", user.id).maybeSingle();
      if (!s) return;
      setStore(s);
      const [{ count: products }, { count: orders }, { data: views }] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }).eq("store_id", s.id),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("store_id", s.id),
        supabase.from("products").select("views").eq("store_id", s.id),
      ]);
      setStats({
        products: products ?? 0,
        orders: orders ?? 0,
        views: (views ?? []).reduce((a, p) => a + (p.views ?? 0), 0),
      });
    })();
  }, [user]);

  const link = store ? `${window.location.origin}/s/${store.slug}` : "";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{store?.name ?? "Your store"}</h1>
      </div>

      {store && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col gap-3 rounded-2xl border border-border/50 bg-gradient-primary/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your store link</p>
            <p className="mt-1 font-mono text-sm">{link}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied"); }}>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <a href={`/s/${store.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> View
              </a>
            </Button>
          </div>
        </motion.div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Package} label="Products" value={stats.products} />
        <StatCard icon={ShoppingCart} label="Orders" value={stats.orders} />
        <StatCard icon={Eye} label="Total views" value={stats.views} />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link to="/products" className="card-3d glass rounded-3xl p-6 transition-shadow hover:shadow-elevated">
          <Package className="h-6 w-6 text-primary" />
          <h3 className="mt-3 text-lg font-semibold">Add products</h3>
          <p className="mt-1 text-sm text-muted-foreground">Build your catalog with photos, prices and stock.</p>
        </Link>
        <Link to="/orders" className="card-3d glass rounded-3xl p-6 transition-shadow hover:shadow-elevated">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h3 className="mt-3 text-lg font-semibold">Manage orders</h3>
          <p className="mt-1 text-sm text-muted-foreground">Track, confirm and fulfill incoming orders in real time.</p>
        </Link>
        <Link to="/customers" className="card-3d glass rounded-3xl p-6 transition-shadow hover:shadow-elevated">
          <Users className="h-6 w-6 text-primary" />
          <h3 className="mt-3 text-lg font-semibold">Customer follow-up</h3>
          <p className="mt-1 text-sm text-muted-foreground">See phone numbers, purchases, and send WhatsApp messages.</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-display text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
