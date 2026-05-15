import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/me/orders")({
  head: () => ({ meta: [{ title: "My orders — Nexa" }] }),
  component: MyOrders,
});

type Row = {
  id: string;
  status: string;
  total: number;
  created_at: string;
  tracking_token: string;
  items: { title: string; qty: number }[];
  store: { name: string; slug: string } | null;
};

function MyOrders() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,status,total,created_at,tracking_token,items,store_id")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      const ids = Array.from(new Set((data ?? []).map((d) => d.store_id)));
      const { data: stores } = ids.length
        ? await supabase.from("stores").select("id,name,slug").in("id", ids)
        : { data: [] };
      const byId = new Map((stores ?? []).map((s) => [s.id, s]));
      setRows(
        (data ?? []).map((o) => ({
          ...(o as never),
          store: (byId.get(o.store_id) as { name: string; slug: string } | undefined) ?? null,
        })),
      );
    })();
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">My orders</h1>
      {rows.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-xl font-semibold">No orders yet</h3>
          <Link to="/explore" className="mt-2 inline-block text-sm text-primary underline">Browse stores</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {rows.map((o) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <Link to="/track/$token" params={{ token: o.tracking_token }} className="glass block rounded-2xl p-4 shadow-soft transition-shadow hover:shadow-elevated">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{o.store?.name ?? "Store"} · {new Date(o.created_at).toLocaleDateString()}</p>
                    <p className="mt-1 truncate font-semibold">{o.items.map((i) => `${i.qty}× ${i.title}`).join(", ")}</p>
                    <span className="mt-1 inline-block rounded-full border border-border/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{o.status}</span>
                  </div>
                  <p className="font-display text-lg font-bold text-primary">₦{Number(o.total).toLocaleString()}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
