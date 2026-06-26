import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { generateProductDescription } from "@/lib/product-ai.functions";
import { createVendorProduct } from "@/lib/commerce.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, ArrowLeft, ArrowRight, Check, ImagePlus, Link2, PackageCheck, Sparkles, Upload, WandSparkles, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/products/new")({
  head: () => ({ meta: [{ title: "New product — Nexa" }] }),
  component: NewProduct,
});

const ICONS = ["🛍️","🍔","🥘","🍰","👗","👟","💄","💍","📱","🎧","💻","📚","🌸","🍹","🍕","🥤"];
type Step = 0 | 1 | 2 | 3;

function NewProduct() {
  const { user } = useAuth();
  const nav = useNavigate();
  const generateDescription = useServerFn(generateProductDescription);
  const createProduct = useServerFn(createVendorProduct);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeLoading, setStoreLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("1");
  const [sourceUrl, setSourceUrl] = useState("");
  const [active, setActive] = useState(true);
  const [icon, setIcon] = useState(ICONS[0]);
  const [images, setImages] = useState<string[]>([]);
  const [step, setStep] = useState<Step>(0);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const profit = (Number(sellPrice) || 0) - (Number(costPrice) || 0);
  const progress = useMemo(() => ((step + 1) / 4) * 100, [step]);

  useEffect(() => {
    if (!user) return;
    setStoreLoading(true);
    supabase.from("stores").select("id").eq("owner_id", user.id).maybeSingle().then(({ data, error }) => {
      if (error) toast.error(error.message);
      setStoreId(data?.id ?? null);
      setStoreLoading(false);
    });
  }, [user]);

  function next() {
    if (step === 0 && title.trim().length < 2) return toast.error("Add a product name first");
    if (step === 1 && (!sellPrice || Number(sellPrice) <= 0)) return toast.error("Add a valid selling price");
    if (step === 1 && (!stock || Number(stock) < 1)) return toast.error("Add at least 1 unit in stock");
    setStep((s) => Math.min(3, s + 1) as Step);
  }

  async function uploadImage(file: File) {
    if (!user) return;
    setUploading(true);
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
    setImages((p) => [...p, pub.publicUrl]);
    setUploading(false);
  }

  async function fillWithAi() {
    if (title.trim().length < 2) return toast.error("Enter the product name first");
    setGenerating(true);
    try {
      const result = await generateDescription({ data: { title: title.trim(), sourceUrl: sourceUrl.trim() } });
      setDescription(result.description);
      toast.success(result.sourceUsed ? "Description generated from the product link" : "Description generated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate description");
    } finally {
      setGenerating(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (!storeId) return toast.error("No store yet");
    if (!title.trim()) return toast.error("Product title is required");
    if ((Number(sellPrice) || 0) <= 0) return toast.error("Selling price must be greater than zero");
    if ((Number(stock) || 0) < 1) return toast.error("Units in stock must be at least 1");
    setSaving(true);
    try {
      await createProduct({
        data: {
          title: title.trim(),
          description: description.trim(),
          sellPrice: Number(sellPrice) || 0,
          costPrice: Number(costPrice) || 0,
          stock: Number(stock) || 0,
          active,
          icon,
          images,
          sourceUrl: sourceUrl.trim(),
        },
      });
      toast.success("Product added");
      nav({ to: "/products", replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not add product";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  if (storeLoading) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-muted-foreground">Preparing your product studio…</div>;
  }

  if (!storeId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-8 text-center shadow-soft">
          <PackageCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Create your store first</h1>
          <p className="mt-2 text-sm text-muted-foreground">Products need a storefront before they can be saved.</p>
          <Button asChild className="mt-6 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Link to="/onboarding">Start onboarding</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Step {step + 1} of 4</p>
          <h1 className="hero-heading font-display text-3xl font-bold sm:text-4xl">Add your first product</h1>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/80 px-4 py-2 text-sm shadow-soft">
          Profit: <span className={profit >= 0 ? "font-semibold text-success" : "font-semibold text-destructive"}>₦{profit.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-elevated backdrop-blur">
        <div className="h-1.5 bg-muted"><motion.div className="h-full bg-gradient-primary" animate={{ width: `${progress}%` }} /></div>
        <div className="grid gap-0 lg:grid-cols-[1fr_280px]">
          <div className="min-h-[460px] p-5 sm:p-7">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="details" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="space-y-5">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><PackageCheck className="h-5 w-5" /></div>
                  <div><h2 className="font-display text-2xl font-semibold">Name the product</h2><p className="mt-1 text-sm text-muted-foreground">Keep it clear for buyers and receipts.</p></div>
                  <div className="space-y-2"><Label htmlFor="title">Product name</Label><Input id="title" required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Jollof Rice + Chicken" className="h-12 rounded-2xl bg-background/70 text-base" /></div>
                  <div className="space-y-2"><Label>Icon if there is no photo</Label><div className="flex flex-wrap gap-2">{ICONS.map((i) => (<button key={i} type="button" onClick={() => setIcon(i)} className={`h-11 w-11 rounded-2xl border text-lg transition hover:-translate-y-0.5 ${icon === i ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow" : "border-border bg-background/70 hover:bg-accent/40"}`}>{i}</button>))}</div></div>
                  <Button type="button" size="lg" onClick={next} className="h-12 w-full rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="price" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="space-y-5">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">₦</div>
                  <div><h2 className="font-display text-2xl font-semibold">Set price and units</h2><p className="mt-1 text-sm text-muted-foreground">Cost price helps you track margin. Buyers only see selling price.</p></div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2"><Label htmlFor="cost">Cost price (₦)</Label><Input id="cost" type="number" min={0} value={costPrice} onChange={(e) => setCostPrice(e.target.value)} className="h-12 rounded-2xl bg-background/70" /></div>
                    <div className="space-y-2"><Label htmlFor="sell">Selling price (₦)</Label><Input id="sell" type="number" min={0} required value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="h-12 rounded-2xl bg-background/70" /></div>
                    <div className="space-y-2"><Label htmlFor="stock">Units in stock</Label><Input id="stock" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} className="h-12 rounded-2xl bg-background/70" /></div>
                  </div>
                  <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep(0)} className="h-12 rounded-2xl"><ArrowLeft className="h-4 w-4" /></Button><Button type="button" size="lg" onClick={next} className="h-12 flex-1 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">Continue</Button></div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="media" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="space-y-5">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><ImagePlus className="h-5 w-5" /></div>
                  <div><h2 className="font-display text-2xl font-semibold">Add images and description</h2><p className="mt-1 text-sm text-muted-foreground">Paste an optional source link, then let AI draft the copy.</p></div>
                  <div className="space-y-2"><Label htmlFor="source"><Link2 className="mr-1 inline h-3 w-3" /> Source product link (optional)</Label><Input id="source" type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://supplier.com/product" className="h-12 rounded-2xl bg-background/70" /></div>
                  <div className="space-y-2"><div className="flex items-center justify-between gap-3"><Label htmlFor="desc">Description</Label><Button type="button" variant="outline" size="sm" onClick={fillWithAi} disabled={generating} className="rounded-xl"><WandSparkles className="h-4 w-4" /> {generating ? "Writing…" : "Generate"}</Button></div><Textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes it special?" className="rounded-2xl bg-background/70" /></div>
                  <div className="space-y-2"><Label>Photos</Label><div className="flex flex-wrap gap-3">{images.map((src, i) => (<div key={src} className="relative h-24 w-24 overflow-hidden rounded-2xl shadow-soft"><img src={src} alt="" className="h-full w-full object-cover" /><button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-background/90 p-1"><X className="h-3 w-3" /></button></div>))}<label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border bg-background/70 text-xs text-muted-foreground transition hover:border-primary hover:bg-primary/5"><Upload className="h-4 w-4" />{uploading ? "Uploading…" : "Add"}<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} /></label></div></div>
                  <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 rounded-2xl"><ArrowLeft className="h-4 w-4" /></Button><Button type="button" size="lg" onClick={next} className="h-12 flex-1 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">Review</Button></div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="review" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} className="space-y-5">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-success/15 text-success"><Check className="h-5 w-5" /></div>
                  <div><h2 className="font-display text-2xl font-semibold">Ready to publish?</h2><p className="mt-1 text-sm text-muted-foreground">You can edit or hide this product later.</p></div>
                  <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/70 p-4"><div><p className="font-medium">Visible in store</p><p className="text-xs text-muted-foreground">Turn off to save as draft.</p></div><Switch checked={active} onCheckedChange={setActive} /></div>
                  {saveError && (
                    <div className="flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}
                  <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setStep(2)} className="h-12 rounded-2xl"><ArrowLeft className="h-4 w-4" /></Button><Button type="submit" size="lg" disabled={saving || uploading} className="h-12 flex-1 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">{saving ? "Saving product…" : uploading ? "Finish upload first" : "Add product"}</Button></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="border-t border-border/60 bg-surface/60 p-5 lg:border-l lg:border-t-0">
            <div className="sticky top-6 rounded-3xl border border-border/60 bg-card p-4 shadow-soft">
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-mesh">
                {images[0] ? <img src={images[0]} alt={title || "Product preview"} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-6xl">{icon}</div>}
              </div>
              <p className="mt-4 truncate font-display text-lg font-semibold">{title || "Product name"}</p>
              <p className="text-sm font-bold text-primary">₦{Number(sellPrice || 0).toLocaleString()}</p>
              <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{description || "Your generated description will appear here."}</p>
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-xs text-primary"><Sparkles className="h-4 w-4" /> Receipt-ready product data</div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
