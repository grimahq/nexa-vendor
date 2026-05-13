import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, MessageCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/s/$slug/p/$productSlug")({
  head: () => ({ meta: [{ title: "Product — Nexa Vendors" }] }),
  component: ProductPage,
});

type S = { id: string; name: string; slug: string; whatsapp: string | null; brand_color: string | null };
type P = { id: string; title: string; slug: string; description: string | null; sell_price: number; stock: number; images: string[] | null; icon: string | null };

function ProductPage() {
  const { slug, productSlug } = Route.useParams();
  const [store, setStore] = useState<S | null>(null);
  const [product, setProduct] = useState<P | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("stores").select("id,name,slug,whatsapp,brand_color").eq("slug", slug).maybeSingle();
      if (!s) return;
      setStore(s as S);
      const { data: p } = await supabase.from("products").select("id,title,slug,description,sell_price,stock,images,icon").eq("store_id", s.id).eq("slug", productSlug).maybeSingle();
      if (p) {
        setProduct(p as P);
        await supabase.from("products").update({ views: (p as { views?: number }).views ? undefined : undefined }).eq("id", p.id);
      }
    })();
  }, [slug, productSlug]);

  if (!store || !product) return <div className="dark flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>;

  const total = qty * Number(product.sell_price);
  const waMsg = encodeURIComponent(`Hi ${store.name}, I'd like to order ${qty}× ${product.title} (₦${total.toLocaleString()}).`);
  const waUrl = store.whatsapp ? `https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${waMsg}` : null;

  return (
    <div className="dark min-h-screen bg-background text-foreground" style={store.brand_color ? { ["--primary" as never]: store.brand_color } : undefined}>
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-3 sm:px-6">
          <Link to="/s/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {store.name}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden rounded-3xl bg-gradient-mesh">
          <div className="aspect-square">
            {product.images?.[0] ? (
              <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl">{product.icon ?? "🛍️"}</div>
            )}
          </div>
        </motion.div>

        <div className="mt-6">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{product.title}</h1>
          <p className="mt-2 font-display text-2xl font-bold text-primary">₦{Number(product.sell_price).toLocaleString()}</p>
          {product.description && <p className="mt-4 text-muted-foreground">{product.description}</p>}
          <p className="mt-3 text-xs text-muted-foreground">{product.stock} in stock</p>
        </div>

        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur">
          <span className="text-sm text-muted-foreground">Quantity</span>
          <div className="ml-auto flex items-center gap-2 rounded-xl bg-background p-1">
            <Button size="icon" variant="ghost" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
            <motion.span key={qty} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-8 text-center font-display text-lg font-bold">{qty}</motion.span>
            <Button size="icon" variant="ghost" onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}><Plus className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="sticky bottom-4 mt-6 flex flex-col gap-2">
          <Button
            size="lg"
            className="h-14 w-full bg-gradient-primary text-base text-primary-foreground shadow-glow hover:opacity-90"
            onClick={() => toast.info("Checkout coming soon — chat the seller for now")}
          >
            <ShoppingBag className="mr-2 h-5 w-5" /> Order now · ₦{total.toLocaleString()}
          </Button>
          {waUrl && (
            <Button asChild size="lg" variant="outline" className="h-12 w-full border-border/60 bg-card/40 backdrop-blur">
              <a href={waUrl} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> Chat seller on WhatsApp
              </a>
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
