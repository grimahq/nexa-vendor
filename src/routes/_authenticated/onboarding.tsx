import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MeshBackground } from "@/components/MeshBackground";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, MessageCircle, Palette, Sparkles, Store, Tags } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Set up your store — Nexa" }] }),
  component: Onboarding,
});

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

const CATEGORIES = ["Food", "Fashion", "Beauty", "Gadgets", "Services", "Affiliate"];
const BRAND_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#111827"];
const STEP_LABELS = ["Store", "Category", "Contact", "Brand", "Review"] as const;
type Step = 0 | 1 | 2 | 3 | 4;

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

  const progress = useMemo(() => ((step + 1) / STEP_LABELS.length) * 100, [step]);

  function next() {
    if (step === 0 && name.trim().length < 2) return toast.error("Enter your store name first");
    if (step === 1 && !category) return toast.error("Select a category");
    if (step === 2 && whatsapp.replace(/\D/g, "").length < 8) return toast.error("Enter a working WhatsApp number");
    setStep((s) => Math.min(4, s + 1) as Step);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (name.trim().length < 2) return toast.error("Enter your store name first");
    if (!category.trim()) return toast.error("Select a category");
    if (whatsapp.replace(/\D/g, "").length < 8) return toast.error("Enter a working WhatsApp number");
    setLoading(true);
    const baseSlug = slugify(name) || `store-${user.id.slice(0, 6)}`;
    let slug = baseSlug;
    try {
      for (let i = 0; i < 10; i++) {
        const { data, error } = await supabase.from("stores").select("id").eq("slug", slug).maybeSingle();
        if (error) throw error;
        if (!data) break;
        slug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;
      }
      const { error } = await supabase.from("stores").insert({
        owner_id: user.id,
        name: name.trim(),
        slug,
        tagline: tagline.trim() || null,
        whatsapp: whatsapp.trim(),
        category: category.trim(),
        brand_color: color,
      });
      if (error) throw error;
      window.dispatchEvent(new Event("nexa:store-created"));
      toast.success("Store created — add your first product");
      nav({ to: "/products/new", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create store");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:py-10">
      <MeshBackground />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative mx-auto w-full max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
          <aside className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-elevated backdrop-blur lg:sticky lg:top-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs shadow-soft">
              <Sparkles className="h-3 w-3 text-primary" /> Store setup
            </div>
            <h1 className="hero-heading mt-5 font-display text-3xl font-bold sm:text-4xl">Screen-by-screen onboarding.</h1>
            <p className="mt-3 text-sm text-muted-foreground">Finish each screen, review the store, then go straight to adding products.</p>
            <div className="mt-6 space-y-2">
              {STEP_LABELS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => index < step && setStep(index as Step)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left text-sm transition-colors ${
                    index === step
                      ? "border-primary bg-primary/10 text-primary"
                      : index < step
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-border/60 bg-background/60 text-muted-foreground"
                  }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-card text-xs font-bold shadow-soft">
                    {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </aside>

          <form onSubmit={submit} className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-elevated backdrop-blur">
          <div className="h-1.5 bg-muted">
            <motion.div className="h-full bg-gradient-primary" animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 120, damping: 22 }} />
          </div>
          <div className="min-h-[560px] p-5 sm:p-7">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepScreen key="name" icon={<Store className="h-5 w-5" />} title="What is your store called?" copy="This becomes your public storefront link.">
                  <div className="space-y-2">
                    <Label htmlFor="name">Store name</Label>
                    <Input id="name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mama Tee Foods" className="h-12 rounded-2xl bg-background/70 text-base" />
                    <p className="text-xs text-muted-foreground">Your link: nexa.app/s/<span className="text-foreground">{slugify(name) || "your-store"}</span></p>
                  </div>
                  <WizardNav onNext={next} nextLabel="Continue" />
                </StepScreen>
              )}

              {step === 1 && (
                <StepScreen key="category" icon={<Tags className="h-5 w-5" />} title="Pick your business category" copy="This helps organize your store and admin reports.">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {CATEGORIES.map((item) => (
                      <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-2xl border p-4 text-left text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-soft ${category === item ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-background/70 text-foreground"}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Or type another category</Label>
                    <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Custom category" className="h-12 rounded-2xl bg-background/70" />
                  </div>
                  <WizardNav onBack={() => setStep(0)} onNext={next} nextLabel="Continue" />
                </StepScreen>
              )}

              {step === 2 && (
                <StepScreen key="contact" icon={<MessageCircle className="h-5 w-5" />} title="Where should customers reach you?" copy="Orders, receipts, and follow-up messages use this contact.">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp number</Label>
                    <Input id="whatsapp" required value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+234…" className="h-12 rounded-2xl bg-background/70" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Textarea id="tagline" rows={3} value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="Hot jollof delivered in 30 mins." className="rounded-2xl bg-background/70" />
                  </div>
                  <WizardNav onBack={() => setStep(1)} onNext={next} nextLabel="Continue" />
                </StepScreen>
              )}

              {step === 3 && (
                <StepScreen key="brand" icon={<Palette className="h-5 w-5" />} title="Choose your store look" copy="Your brand color appears on storefront buttons and highlights.">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {BRAND_COLORS.map((brandColor) => (
                      <button key={brandColor} type="button" onClick={() => setColor(brandColor)} className={`h-16 rounded-2xl border shadow-soft transition-transform hover:-translate-y-0.5 ${color === brandColor ? "border-foreground ring-2 ring-ring" : "border-border/60"}`} style={{ backgroundColor: brandColor }} aria-label={`Use ${brandColor}`} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 p-4">
                    <div>
                      <p className="text-sm font-medium">Custom brand color</p>
                      <p className="text-xs text-muted-foreground">Pick any exact shade.</p>
                    </div>
                    <input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 cursor-pointer rounded-xl border border-border bg-transparent" />
                  </div>
                  <WizardNav onBack={() => setStep(2)} onNext={next} nextLabel="Review store" />
                </StepScreen>
              )}

              {step === 4 && (
                <StepScreen key="review" icon={<BadgeCheck className="h-5 w-5" />} title="Review and create your store" copy="Confirm the details before moving to the product screen.">
                  <div className="rounded-3xl border border-border/60 bg-background/70 p-5 shadow-soft">
                    <div className="flex items-start gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-xl font-bold text-primary-foreground shadow-glow" style={{ backgroundColor: color }}>{name.trim().slice(0, 1).toUpperCase() || "N"}</div>
                      <div className="min-w-0">
                        <p className="font-display text-xl font-semibold">{name || "Store name"}</p>
                        <p className="text-sm text-muted-foreground">{tagline || "No tagline yet"}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{category || "Category"}</span>
                          <span className="rounded-full bg-success/10 px-3 py-1 text-success">{whatsapp || "WhatsApp"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setStep(3)} className="h-12 rounded-2xl"><ArrowLeft className="h-4 w-4" /></Button>
                    <Button type="submit" size="lg" disabled={loading} className="h-12 flex-1 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                      {loading ? "Creating…" : "Create store & add product"}
                    </Button>
                  </div>
                </StepScreen>
              )}
            </AnimatePresence>
          </div>
        </form>
        </div>
      </motion.div>
    </div>
  );
}

function StepScreen({ icon, title, copy, children }: { icon: React.ReactNode; title: string; copy: string; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="flex min-h-[500px] flex-col justify-center space-y-5">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">{icon}</div>
      <div>
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">{copy}</p>
      </div>
      {children}
    </motion.div>
  );
}

function WizardNav({ onBack, onNext, nextLabel }: { onBack?: () => void; onNext: () => void; nextLabel: string }) {
  return (
    <div className="flex gap-2 pt-2">
      {onBack && <Button type="button" variant="outline" onClick={onBack} className="h-12 rounded-2xl"><ArrowLeft className="h-4 w-4" /></Button>}
      <Button type="button" size="lg" onClick={onNext} className="h-12 flex-1 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
        {nextLabel} <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
