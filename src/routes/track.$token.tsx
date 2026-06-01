import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Clock, Package, Truck, XCircle, MessageCircle, Printer, Share2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/track/$token")({
  head: () => ({ meta: [{ title: "Track order — Nexa" }] }),
  component: TrackPage,
});

type Order = {
  id: string;
  status: string;
  total: number;
  fulfillment: string;
  address: string | null;
  buyer_name: string;
  items: { title: string; qty: number; price: number }[];
  created_at: string;
  store: { name: string; slug: string; whatsapp: string | null; logo_url: string | null } | null;
};

const STEPS = [
  { key: "pending", label: "Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "fulfilled", label: "Fulfilled", icon: Package },
  { key: "delivered", label: "Delivered", icon: Truck },
] as const;

function TrackPage() {
  const { token } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("id,status,total,fulfillment,address,buyer_name,items,created_at,store_id")
        .eq("tracking_token", token)
        .maybeSingle();
      if (!data) {
        if (mounted) setNotFound(true);
        return;
      }
      const { data: store } = await supabase
        .from("stores")
        .select("name,slug,whatsapp,logo_url")
        .eq("id", data.store_id)
        .maybeSingle();
      if (mounted) setOrder({ ...(data as unknown as Omit<Order, "store">), store: (store as Order["store"]) ?? null });
    }
    load();
    const ch = supabase
      .channel(`track-${token}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => {
      mounted = false;
      supabase.removeChannel(ch);
    };
  }, [token]);

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
        <h1 className="font-display text-3xl font-bold">Order not found</h1>
        <Link to="/" className="text-primary underline">Back home</Link>
      </div>
    );
  }
  if (!order) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>;

  const cancelled = order.status === "cancelled";
  const stepIdx = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/70 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Logo />
          {order.store && (
            <Link to="/s/$slug" params={{ slug: order.store.slug }} className="text-sm text-muted-foreground hover:text-foreground">
              ← {order.store.name}
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Order tracking</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {cancelled ? "Cancelled" : `Hi ${order.buyer_name.split(" ")[0]}`}
          </h1>
          <p className="mt-2 text-muted-foreground">
            From <span className="text-foreground">{order.store?.name}</span> · placed {new Date(order.created_at).toLocaleString()}
          </p>
        </motion.div>

        {!cancelled ? (
          <div className="mt-8 rounded-3xl border border-border/50 bg-card/40 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              {STEPS.map((s, i) => {
                const done = i <= stepIdx;
                const Icon = s.icon;
                return (
                  <div key={s.key} className="flex flex-1 flex-col items-center">
                    <motion.div
                      animate={done ? { scale: [0.8, 1.1, 1] } : { scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${done ? "bg-gradient-primary text-primary-foreground shadow-glow" : "bg-muted/30 text-muted-foreground"}`}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.div>
                    <p className={`mt-2 text-[11px] ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                    {i < STEPS.length - 1 && (
                      <div className={`mt-1 hidden h-0.5 w-full ${i < stepIdx ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-8 flex items-center gap-3 rounded-3xl border border-destructive/40 bg-destructive/10 p-6">
            <XCircle className="h-6 w-6 text-destructive" />
            <p className="text-sm">This order was cancelled. Reach out to the seller if this is a mistake.</p>
          </div>
        )}

        <div className="mt-6 rounded-3xl border border-border/50 bg-card/40 p-6 backdrop-blur">
          <h3 className="text-sm font-semibold text-muted-foreground">Items</h3>
          <ul className="mt-3 space-y-2">
            {order.items.map((it, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span>{it.qty}× {it.title}</span>
                <span className="font-mono">₦{(it.qty * it.price).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
            <span className="text-sm text-muted-foreground capitalize">{order.fulfillment}</span>
            <span className="font-display text-xl font-bold text-primary">₦{Number(order.total).toLocaleString()}</span>
          </div>
          {order.address && <p className="mt-3 text-xs text-muted-foreground">Delivery to: {order.address}</p>}
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-3 print:hidden">
          {order.store?.whatsapp && (
            <Button asChild size="lg" variant="outline" className="h-12 border-border/60 bg-card/40 backdrop-blur">
              <a href={`https://wa.me/${order.store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> Message seller
              </a>
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-border/60 bg-card/40 backdrop-blur"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-5 w-5" /> Print receipt
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-12 border-border/60 bg-card/40 backdrop-blur"
            onClick={async () => {
              const url = window.location.href;
              if (navigator.share) {
                try {
                  await navigator.share({ title: `Nexa order from ${order.store?.name ?? ""}`, url });
                } catch { /* dismissed */ }
              } else {
                await navigator.clipboard.writeText(url);
                toast.success("Tracking link copied");
              }
            }}
          >
            <Share2 className="mr-2 h-5 w-5" /> Share
          </Button>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground print:hidden">
          Receipt ID · <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
        </p>
      </main>

      <style>{`
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .dark { color-scheme: light; }
          header, nav, button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
