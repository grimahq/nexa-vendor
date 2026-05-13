import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MeshBackground } from "@/components/MeshBackground";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Set up your store — Nexa" }] }),
  component: Onboarding,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

function Onboarding() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("#7C3AED");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const baseSlug = slugify(name) || `store-${user.id.slice(0, 6)}`;
    let slug = baseSlug;
    // Ensure unique slug
    for (let i = 0; i < 5; i++) {
      const { data } = await supabase.from("stores").select("id").eq("slug", slug).maybeSingle();
      if (!data) break;
      slug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;
    }
    const { error } = await supabase.from("stores").insert({
      owner_id: user.id,
      name,
      slug,
      tagline,
      whatsapp,
      category,
      brand_color: color,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Store created — let's add your first product");
    nav({ to: "/products" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <MeshBackground />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs">
          <Sparkles className="h-3 w-3 text-primary" /> Step 1 of 1 — Brand setup
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Let's build your store.</h1>
        <p className="mt-3 text-muted-foreground">A few quick details and you'll have a shareable link.</p>

        <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-border/50 bg-card/40 p-6 backdrop-blur shadow-soft">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Store name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mama Tee Foods" />
              {name && <p className="text-xs text-muted-foreground">Your link: nexa.app/s/<span className="text-foreground">{slugify(name) || "your-store"}</span></p>}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea id="tagline" rows={2} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Hot jollof delivered in 30 mins." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp number</Label>
              <Input id="whatsapp" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+234…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Food, Fashion, Affiliate…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Brand color</Label>
              <div className="flex items-center gap-3">
                <input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 cursor-pointer rounded-md border border-border bg-transparent" />
                <span className="text-sm text-muted-foreground">{color}</span>
              </div>
            </div>
          </div>
          <Button type="submit" size="lg" disabled={loading} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            {loading ? "Creating…" : "Create my store"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
