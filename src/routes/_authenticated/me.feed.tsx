import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/_authenticated/me/feed")({
  head: () => ({ meta: [{ title: "My feed — Nexa" }] }),
  component: FeedPage,
});

type Store = { id: string; name: string; slug: string; tagline: string | null; logo_url: string | null; verified: boolean };

function FeedPage() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: f } = await supabase.from("follows").select("store_id").eq("buyer_id", user.id);
      const ids = (f ?? []).map((x) => x.store_id);
      if (ids.length === 0) return setStores([]);
      const { data } = await supabase.from("stores").select("id,name,slug,tagline,logo_url,verified").in("id", ids);
      setStores((data ?? []) as Store[]);
    })();
  }, [user]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Stores you follow</h1>
      {stores.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-border/60 bg-card/30 p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 font-display text-xl font-semibold">Nothing here yet</h3>
          <Link to="/explore" className="mt-2 inline-block text-sm text-primary underline">Find stores to follow</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {stores.map((s) => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <Link to="/s/$slug" params={{ slug: s.slug }} className="glass flex items-center gap-4 rounded-2xl p-4 shadow-soft hover:shadow-elevated">
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow font-display text-lg font-bold">
                  {s.logo_url ? <img src={s.logo_url} alt="" className="h-full w-full rounded-2xl object-cover" /> : s.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{s.name}{s.verified && " ✓"}</p>
                  {s.tagline && <p className="truncate text-xs text-muted-foreground">{s.tagline}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
