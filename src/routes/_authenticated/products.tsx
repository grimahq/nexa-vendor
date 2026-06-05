import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, Package, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({ meta: [{ title: "Products — Nexa" }] }),
  component: ProductsPage,
});

type P = { id: string; title: string; sell_price: number; stock: number; images: string[] | null; icon: string | null; slug: string; active: boolean; views: number };

function ProductsPage() {
  const { user } = useAuth();
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [items, setItems] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh(uid: string) {
    setLoading(true);
    const { data: s, error: storeError } = await supabase.from("stores").select("id,slug").eq("owner_id", uid).maybeSingle();
    if (storeError) {
      toast.error(storeError.message);
      setLoading(false);
      return;
    }
    if (!s) {
      setItems([]);
      setLoading(false);
      return;
    }
    setStoreSlug(s.slug);
    const { data, error } = await supabase.from("products").select("id,title,sell_price,stock,images,icon,slug,active,views").eq("store_id", s.id).order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data ?? []) as P[]);
    setLoading(false);
  }

  useEffect(() => { if (user) refresh(user.id); }, [user]);

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((p) => p.filter((x) => x.id !== id));
    toast.success("Deleted");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your catalog. Every product gets a shareable link.</p>
        </div>
        <Button asChild className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
          <Link to="/products/new"><Plus className="mr-2 h-4 w-4" /> New product</Link>
        </Button>
      </div>

      {loading ? (
        <p className="mt-12 text-center text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-16 rounded-3xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-xl font-semibold">No products yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Add your first product to start selling.</p>
          <Button asChild className="mt-6 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/products/new"><Plus className="mr-2 h-4 w-4" /> Add product</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-elevated">
              <div className="relative aspect-square overflow-hidden bg-gradient-mesh">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl transition-transform duration-500 group-hover:scale-110">{p.icon ?? "🛍️"}</div>
                )}
                {!p.active && <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shadow-soft">Hidden</span>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 truncate font-medium leading-tight">{p.title}</h3>
                  <p className="shrink-0 font-display font-bold text-primary">₦{Number(p.sell_price).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.stock} in stock · {p.views} views</p>
                <div className="mt-4 flex gap-2">
                  {storeSlug && (
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={`/s/${storeSlug}/p/${p.slug}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-1 h-3 w-3" /> View
                      </a>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => remove(p.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
