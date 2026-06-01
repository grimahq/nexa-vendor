import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, MessageCircle, ShoppingBag, Heart } from "lucide-react";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { toast } from "sonner";

export const Route = createFileRoute("/s/$slug/p/$productSlug")({
  head: () => ({ meta: [{ title: "Product — Nexa Vendors" }] }),
  component: ProductPage,
});

type S = { id: string; name: string; slug: string; whatsapp: string | null; brand_color: string | null };
type P = { id: string; title: string; slug: string; description: string | null; sell_price: number; stock: number; images: string[] | null; icon: string | null };

function ProductPage() {
  const { slug, productSlug } = Route.useParams();
  const { user } = useAuth();
  const [store, setStore] = useState<S | null>(null);
  const [product, setProduct] = useState<P | null>(null);
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("stores").select("id,name,slug,whatsapp,brand_color").eq("slug", slug).maybeSingle();
      if (!s) return;
      setStore(s as S);
      const { data: p } = await supabase.from("products").select("id,title,slug,description,sell_price,stock,images,icon").eq("store_id", s.id).eq("slug", productSlug).maybeSingle();
      if (!p) return;
      setProduct(p as P);
      const { count } = await supabase.from("likes").select("id", { count: "exact", head: true }).eq("product_id", p.id);
      setLikes(count ?? 0);
      if (user) {
        const { data: my } = await supabase.from("likes").select("id").eq("product_id", p.id).eq("buyer_id", user.id).maybeSingle();
        setLiked(!!my);
      }
    })();
  }, [slug, productSlug, user]);

  async function toggleLike() {
    if (!user) return toast.info("Sign in to like products");
    if (!product) return;
    if (liked) {
      await supabase.from("likes").delete().eq("product_id", product.id).eq("buyer_id", user.id);
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
    } else {
      await supabase.from("likes").insert({ product_id: product.id, buyer_id: user.id });
      setLiked(true);
      setLikes((n) => n + 1);
    }
  }

  if (!store || !product) return <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>;

  const total = qty * Number(product.sell_price);
  const waMsg = encodeURIComponent(`Hi ${store.name}, I'd like to order ${qty}× ${product.title} (₦${total.toLocaleString()}).`);
  const waUrl = store.whatsapp ? `https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${waMsg}` : null;

  return (
    <div className="min-h-screen bg-background text-foreground" style={store.brand_color ? { ["--primary" as never]: store.brand_color } : undefined}>
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/s/$slug" params={{ slug }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> {store.name}
          </Link>
          <button onClick={toggleLike} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-3 py-1.5 text-xs backdrop-blur">
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} /> {likes}
          </button>
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
            onClick={() => setOpen(true)}
            disabled={product.stock <= 0}
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

      <CheckoutDialog open={open} onOpenChange={setOpen} store={store} product={product} qty={qty} />
    </div>
  );
}
