import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MeshBackground } from "@/components/MeshBackground";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, MessageCircle, Palette, Sparkles, Store } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Set up your store — Nexa" }] }),
  component: Onboarding,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

const CATEGORIES = ["Food", "Fashion", "Beauty", "Gadgets", "Services", "Affiliate"];
type Step = 0 | 1 | 2;

function Onboarding() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [step, setStep] = useState<Step>(0);
  const [loading, setLoading] = useState(false);

  const progress = useMemo(() => ((step + 1) / 3) * 100, [step]);

  function next() {
    if (step === 0 && name.trim().length < 2) return toast.error("Enter your store name first");
    if (step === 1 && !category) return toast.error("Select a category");
    setStep((s) => Math.min(2, s + 1) as Step);
  }

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
      name: name.trim(),
      slug,
      tagline: tagline.trim(),
      whatsapp: whatsapp.trim(),
      category,
      brand_color: color,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    window.dispatchEvent(new Event("nexa:store-created"));
    toast.success("Store created — add your first product");
    nav({ to: "/products/new", replace: true });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <MeshBackground />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs shadow-soft">
          <Sparkles className="h-3 w-3 text-primary" /> Store setup · then first product
        </div>
        <h1 className="hero-heading font-display text-4xl font-bold sm:text-5xl">Let's build your store.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">One clear step at a time. Finish this and you'll land directly on the product screen.</p>

        <form onSubmit={submit} className="mt-8 overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-elevated backdrop-blur">
          <div className="h-1.5 bg-muted">
            <motion.div className="h-full bg-gradient-primary" animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 120, damping: 22 }} />
          </div>
          <div className="p-5 sm:p-7">
            {step === 0 && (
              <motion.div key="name" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Store className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-display text-2xl font-semibold">What is your store called?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">This becomes your public storefront link.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Store name</Label>
                  <Input id="name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mama Tee Foods" className="h-12 rounded-2xl bg-background/70 text-base" />
                  {name && <p className="text-xs text-muted-foreground">Your link: nexa.app/s/<span className="text-foreground">{slugify(name) || "your-store"}</span></p>}
                </div>
                <Button type="button" size="lg" onClick={next} className="h-12 w-full rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="category" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Check className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-display text-2xl font-semibold">Pick your category</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Tap once and we'll move you forward.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {CATEGORIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => { setCategory(item); setStep(2); }}
                      className={`rounded-2xl border p-4 text-left text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-soft ${category === item ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background/70 text-foreground"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Or type another category</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Custom category" className="h-12 rounded-2xl bg-background/70" />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} className="h-12 rounded-2xl"><ArrowLeft className="h-4 w-4" /></Button>
                  <Button type="button" size="lg" onClick={next} className="h-12 flex-1 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">Continue</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="contact" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><MessageCircle className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-display text-2xl font-semibold">Where should customers reach you?</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Orders, receipts, and follow-up messages use this contact.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp number</Label>
                  <Input id="whatsapp" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+234…" className="h-12 rounded-2xl bg-background/70" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Textarea id="tagline" rows={2} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Hot jollof delivered in 30 mins." className="rounded-2xl bg-background/70" />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 p-4">
                  <div className="flex items-center gap-3">
                    <Palette className="h-4 w-4 text-primary" />
                    <div><p className="text-sm font-medium">Brand color</p><p className="text-xs text-muted-foreground">Used on your store buttons.</p></div>
                  </div>
                  <input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-xl border border-border bg-transparent" />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 rounded-2xl"><ArrowLeft className="h-4 w-4" /></Button>
                  <Button type="submit" size="lg" disabled={loading} className="h-12 flex-1 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                    {loading ? "Creating…" : "Create store & add product"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
