import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageCircle, CheckCircle2, XCircle, Truck, Package, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "Orders — Nexa" }] }),
  component: OrdersPage,
});

type Order = {
  id: string;
  status: "pending" | "confirmed" | "fulfilled" | "delivered" | "cancelled";
  buyer_name: string;
  buyer_phone: string;
  fulfillment: "pickup" | "delivery";
  address: string | null;
  total: number;
  items: { title: string; qty: number; price: number }[];
  tracking_token: string;
  created_at: string;
};

const FILTERS = ["all", "pending", "confirmed", "fulfilled", "delivered", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

const STATUS_META: Record<Order["status"], { label: string; icon: typeof Clock; cls: string }> = {
  pending: { label: "Pending", icon: Clock, cls: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  fulfilled: { label: "Fulfilled", icon: Package, cls: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  delivered: { label: "Delivered", icon: Truck, cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  cancelled: { label: "Cancelled", icon: XCircle, cls: "bg-rose-500/15 text-rose-300 border-rose-500/30" },
};

function OrdersPage() {
  const { user } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    (async () => {
      const { data: s } = await supabase.from("stores").select("id").eq("owner_id", user.id).maybeSingle();
      if (!s) return setLoading(false);
      setStoreId(s.id);
      const { data } = await supabase
        .from("orders")
        .select("id,status,buyer_name,buyer_phone,fulfillment,address,total,items,tracking_token,created_at")
        .eq("store_id", s.id)
        .order("created_at", { ascending: false });
      setOrders((data ?? []) as Order[]);
      setLoading(false);
      channel = supabase
        .channel(`orders-${s.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders", filter: `store_id=eq.${s.id}` },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setOrders((prev) => [payload.new as Order, ...prev]);
              toast.success(`New order from ${(payload.new as Order).buyer_name}`);
            } else if (payload.eventType === "UPDATE") {
              setOrders((prev) => prev.map((o) => (o.id === (payload.new as Order).id ? (payload.new as Order) : o)));
            }
          },
        )
        .subscribe();
    })();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  async function setStatus(id: string, status: Order["status"]) {
    const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
  }

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">Realtime — new orders pop in instantly.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f === "all" ? orders.length : orders.filter((o) => o.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors ${filter === f ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
            >
              {f} <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-xl font-semibold">No orders here</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {storeId ? "Share your store link to start receiving orders." : "Set up your store first."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          <AnimatePresence initial={false}>
            {filtered.map((o) => {
              const meta = STATUS_META[o.status];
              const Icon = meta.icon;
              const wa = `https://wa.me/${o.buyer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${o.buyer_name}, about your order…`)}`;
              return (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="glass rounded-2xl p-4 shadow-soft sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${meta.cls}`}>
                          <Icon className="h-3 w-3" /> {meta.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</span>
                      </div>
                      <p className="mt-2 font-semibold">{o.buyer_name} · {o.buyer_phone}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {o.fulfillment}{o.address ? ` · ${o.address}` : ""}
                      </p>
                      <ul className="mt-2 text-sm text-muted-foreground">
                        {o.items.map((it, i) => (
                          <li key={i}>{it.qty}× {it.title}</li>
                        ))}
                      </ul>
                    </div>
                    <p className="font-display text-2xl font-bold text-primary">₦{Number(o.total).toLocaleString()}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {o.status === "pending" && (
                      <Button size="sm" onClick={() => setStatus(o.id, "confirmed")} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                        Confirm
                      </Button>
                    )}
                    {o.status === "confirmed" && (
                      <Button size="sm" onClick={() => setStatus(o.id, "fulfilled")} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                        Mark fulfilled
                      </Button>
                    )}
                    {o.status === "fulfilled" && (
                      <Button size="sm" onClick={() => setStatus(o.id, "delivered")} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                        Mark delivered
                      </Button>
                    )}
                    {o.status !== "cancelled" && o.status !== "delivered" && (
                      <Button size="sm" variant="outline" onClick={() => setStatus(o.id, "cancelled")}>
                        Cancel
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <a href={wa} target="_blank" rel="noreferrer">
                        <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <a href={`/track/${o.tracking_token}`} target="_blank" rel="noreferrer">View tracking</a>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
