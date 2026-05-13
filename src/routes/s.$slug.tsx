import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/s/$slug")({
  head: () => ({ meta: [{ title: "Store — Nexa Vendors" }] }),
  component: StorePage,
});

type S = { id: string; name: string; slug: string; tagline: string | null; logo_url: string | null; verified: boolean; brand_color: string | null; whatsapp: string | null; category: string | null };
type P = { id: string; title: string; slug: string; sell_price: number; stock: number; images: string[] | null; icon: string | null };

function StorePage() {
  const { slug } = Route.useParams();
  const [store, setStore] = useState<S | null>(null);
  const [products, setProducts] = useState<P[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("stores").select("id,name,slug,tagline,logo_url,verified,brand_color,whatsapp,category").eq("slug", slug).maybeSingle();
      if (!s) return setNotFound(true);
      setStore(s as S);
      const { data: p } = await supabase.from("products").select("id,title,slug,sell_price,stock,images,icon").eq("store_id", s.id).eq("active", true).order("created_at", { ascending: false });
      setProducts((p ?? []) as P[]);
    })();
  }, [slug]);

  if (notFound) {
    return (
      <div className="dark flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
        <h1 className="font-display text-3xl font-bold">Store not found</h1>
        <Link to="/explore" className="text-primary underline">Browse stores</Link>
      </div>
    );
  }

  if (!store) return <div className="dark flex min-h-screen items-center justify-center bg-background text-muted-foreground">Loading…</div>;

  return (
    <div className="dark min-h-screen bg-background text-foreground" style={store.brand_color ? { ["--primary" as never]: store.brand_color } : undefined}>
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Explore
          </Link>
          {store.whatsapp && (
            <Button asChild size="sm" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Chat
              </a>
            </Button>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-60" />
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-primary text-primary-foreground shadow-glow font-display text-2xl font-bold">
              {store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full rounded-3xl object-cover" /> : store.name[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{store.name}</h1>
                {store.verified && <ShieldCheck className="h-5 w-5 text-primary" />}
              </div>
              {store.category && <p className="text-sm text-muted-foreground">{store.category}</p>}
            </div>
          </motion.div>
          {store.tagline && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{store.tagline}</p>}
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        {products.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-border/60 bg-card/30 p-12 text-center text-muted-foreground">No products listed yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link key={p.id} to="/s/$slug/p/$productSlug" params={{ slug: store.slug, productSlug: p.slug }} className="card-3d glass overflow-hidden rounded-2xl shadow-soft">
                <div className="relative aspect-square overflow-hidden bg-gradient-mesh">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">{p.icon ?? "🛍️"}</div>
                  )}
                </div>
                <div className="flex items-center justify-between p-4">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="font-display font-bold text-primary">₦{Number(p.sell_price).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
