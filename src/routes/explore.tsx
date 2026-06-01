import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { MeshBackground } from "@/components/MeshBackground";
import { ShieldCheck, Store } from "lucide-react";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore stores — Nexa Vendors" }] }),
  component: Explore,
});

type S = { id: string; name: string; slug: string; tagline: string | null; logo_url: string | null; verified: boolean; brand_color: string | null; category: string | null };

function Explore() {
  const [stores, setStores] = useState<S[]>([]);
  useEffect(() => {
    supabase.from("stores").select("id,name,slug,tagline,logo_url,verified,brand_color,category").order("created_at", { ascending: false }).limit(60).then(({ data }) => setStores((data ?? []) as S[]));
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <MeshBackground />
      <SiteHeader />
      <main className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Discover live stores</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Real vendors selling on WhatsApp — powered by Nexa.</p>

        {stores.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-border/60 bg-card/30 p-16 text-center">
            <Store className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">No stores yet — be the first.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <Link key={s.id} to="/s/$slug" params={{ slug: s.slug }} className="card-3d glass rounded-3xl p-6 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow font-display font-bold">
                    {s.logo_url ? <img src={s.logo_url} alt="" className="h-full w-full rounded-2xl object-cover" /> : s.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold">{s.name}</h3>
                      {s.verified && <ShieldCheck className="h-4 w-4 text-primary" />}
                    </div>
                    {s.category && <p className="text-xs text-muted-foreground">{s.category}</p>}
                  </div>
                </div>
                {s.tagline && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{s.tagline}</p>}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
