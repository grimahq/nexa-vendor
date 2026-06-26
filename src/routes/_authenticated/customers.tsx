import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MessageCircle, Package, Phone, Search, ShoppingBag, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({ meta: [{ title: "Customers — Nexa" }] }),
  component: CustomersPage,
});

type OrderRow = {
  id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string | null;
  total: number;
  items: { title: string; qty: number; price: number }[];
  created_at: string;
};

type Customer = {
  name: string;
  phone: string;
  orders: number;
  total: number;
  lastSeen: string;
  items: string[];
  quantity: number;
  email: string | null;
};

function CustomersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).maybeSingle();
      if (!store) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("orders")
        .select("id,buyer_name,buyer_phone,buyer_email,total,items,created_at")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });
      setOrders((data ?? []) as unknown as OrderRow[]);
      setLoading(false);
    })();
  }, [user]);

  const customers = useMemo(() => {
    const grouped = new Map<string, Customer>();
    for (const order of orders) {
      const key = order.buyer_phone.replace(/\D/g, "") || order.buyer_phone;
      const current = grouped.get(key) ?? {
        name: order.buyer_name,
        phone: order.buyer_phone,
        orders: 0,
        total: 0,
        lastSeen: order.created_at,
        items: [],
        quantity: 0,
        email: order.buyer_email,
      };
      current.orders += 1;
      current.total += Number(order.total) || 0;
      current.lastSeen = current.lastSeen > order.created_at ? current.lastSeen : order.created_at;
      current.items = Array.from(new Set([...current.items, ...order.items.map((item) => item.title)])).slice(0, 6);
      current.quantity += order.items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
      current.email = current.email || order.buyer_email;
      grouped.set(key, current);
    }
    return Array.from(grouped.values()).filter((customer) => {
      const q = query.toLowerCase().trim();
      if (!q) return true;
      return `${customer.name} ${customer.phone} ${customer.items.join(" ")}`.toLowerCase().includes(q);
    });
  }, [orders, query]);

  const totalRevenue = customers.reduce((sum, customer) => sum + customer.total, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Saved automatically from paid and WhatsApp orders</p>
          <h1 className="hero-heading font-display text-3xl font-bold sm:text-4xl">Customers</h1>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers" className="h-11 w-full rounded-2xl border border-border/60 bg-card/80 pl-9 pr-3 text-sm outline-none ring-ring transition focus:ring-2" />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat icon={Users} label="Customers" value={customers.length.toLocaleString()} />
        <Stat icon={Package} label="Orders" value={orders.length.toLocaleString()} />
        <Stat icon={Phone} label="Sales value" value={`₦${totalRevenue.toLocaleString()}`} />
      </div>

      {loading ? (
        <p className="mt-12 text-center text-muted-foreground">Loading customers…</p>
      ) : customers.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border/60 bg-card/50 p-12 text-center shadow-soft">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-xl font-semibold">No customers yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Buyers who order from you will appear here with phone numbers and purchase items.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {customers.map((customer, index) => {
            const purchased = customer.items.slice(0, 3).join(", ");
            const message = encodeURIComponent(`Hi ${customer.name}, thank you for buying ${purchased || "from us"}. We have new stock and offers today — would you like me to send options?`);
            const phone = customer.phone.replace(/\D/g, "");
            return (
              <motion.div key={customer.phone} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-primary font-display font-bold text-primary-foreground shadow-glow">
                        {customer.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-display text-lg font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}{customer.email ? ` · ${customer.email}` : ""}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {customer.items.map((item) => <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">{item}</span>)}
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <ShoppingBag className="h-3.5 w-3.5" /> {customer.quantity} item{customer.quantity === 1 ? "" : "s"} purchased
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 sm:items-end">
                    <div className="text-left sm:text-right">
                      <p className="font-display text-xl font-bold text-primary">₦{customer.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{customer.orders} order{customer.orders === 1 ? "" : "s"} · {new Date(customer.lastSeen).toLocaleDateString()}</p>
                    </div>
                    {phone ? (
                      <Button asChild variant="outline" className="rounded-2xl">
                        <a href={`https://wa.me/${phone}?text=${message}`} target="_blank" rel="noreferrer">
                          <MessageCircle className="h-4 w-4" /> Follow up
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" className="rounded-2xl" disabled>
                        <MessageCircle className="h-4 w-4" /> No WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card/80 p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
        <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-display text-xl font-bold">{value}</p></div>
      </div>
    </div>
  );
}
