import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Store = { id: string; name: string; slug: string; logo_url: string | null; category: string | null; brand_color: string | null };

// Fallback brands so the strip never looks empty before any KYC approvals.
const FALLBACK: Store[] = [
  { id: "f1", name: "Boltshift", slug: "boltshift", logo_url: null, category: "Tech", brand_color: "#0EA5E9" },
  { id: "f2", name: "Lightbox", slug: "lightbox", logo_url: null, category: "Studio", brand_color: "#F97316" },
  { id: "f3", name: "FeatherDev", slug: "featherdev", logo_url: null, category: "Agency", brand_color: "#10B981" },
  { id: "f4", name: "GlobalBank", slug: "globalbank", logo_url: null, category: "Finance", brand_color: "#6366F1" },
  { id: "f5", name: "Nietzsche", slug: "nietzsche", logo_url: null, category: "Editorial", brand_color: "#EAB308" },
  { id: "f6", name: "Mama Tee", slug: "mama-tee", logo_url: null, category: "Food", brand_color: "#EF4444" },
];

export function VerifiedMarquee() {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    supabase
      .from("stores")
      .select("id,name,slug,logo_url,category,brand_color")
      .eq("verified", true)
      .order("updated_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        setStores((data && data.length > 0 ? (data as Store[]) : FALLBACK));
      });
  }, []);

  const list = stores.length > 0 ? stores : FALLBACK;
  const loop = [...list, ...list];
  const isReal = stores.length > 0 && stores !== FALLBACK && stores[0]?.id !== "f1";

  return (
    <div className="relative overflow-hidden">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />

      <motion.div
        className="flex w-max gap-10 py-2"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, ease: "linear", repeat: Infinity }}
      >
        {loop.map((s, i) => {
          const Inner = (
            <div className="group flex items-center gap-3 px-4">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold text-white shadow-soft"
                style={{ background: s.brand_color ?? "#7C3AED" }}
              >
                {s.logo_url ? (
                  <img src={s.logo_url} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  s.name.slice(0, 1).toUpperCase()
                )}
              </span>
              <span className="whitespace-nowrap font-display text-xl font-semibold tracking-tight text-foreground/85 transition-colors group-hover:text-foreground">
                {s.name}
              </span>
              <ShieldCheck className="h-4 w-4 shrink-0 fill-primary text-background" />
            </div>
          );
          return isReal ? (
            <Link key={`${s.id}-${i}`} to="/s/$slug" params={{ slug: s.slug }}>
              {Inner}
            </Link>
          ) : (
            <div key={`${s.id}-${i}`} className="opacity-80">
              {Inner}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
