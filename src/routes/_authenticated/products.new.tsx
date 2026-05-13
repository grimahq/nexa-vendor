import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/products/new")({
  head: () => ({ meta: [{ title: "New product — Nexa" }] }),
  component: NewProduct,
});

const ICONS = ["🛍️","🍔","🥘","🍰","👗","👟","💄","💍","📱","🎧","💻","📚","🌸","🍹","🍕","🥤"];
const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

function NewProduct() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [storeId, setStoreId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [active, setActive] = useState(true);
  const [icon, setIcon] = useState(ICONS[0]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("stores").select("id").eq("owner_id", user.id).maybeSingle().then(({ data }) => setStoreId(data?.id ?? null));
  }, [user]);

  async function uploadImage(file: File) {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
    setImages((p) => [...p, pub.publicUrl]);
    setUploading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!storeId) return toast.error("No store yet");
    setSaving(true);
    const baseSlug = slugify(title) || `item-${Date.now()}`;
    const { error } = await supabase.from("products").insert({
      store_id: storeId,
      title,
      slug: baseSlug,
      description,
      sell_price: Number(sellPrice) || 0,
      cost_price: Number(costPrice) || 0,
      stock: Number(stock) || 0,
      active,
      icon,
      images,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Product added");
    nav({ to: "/products" });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">New product</h1>

      <form onSubmit={submit} className="mt-8 space-y-6 rounded-3xl border border-border/50 bg-card/40 p-6 backdrop-blur shadow-soft">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Jollof Rice + Chicken" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes it special?" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="sell">Selling price (₦)</Label>
            <Input id="sell" type="number" min={0} required value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Cost price (₦)</Label>
            <Input id="cost" type="number" min={0} value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Icon (used when no photo)</Label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={`h-10 w-10 rounded-xl border text-lg transition ${icon === i ? "border-primary bg-gradient-primary text-primary-foreground shadow-glow" : "border-border bg-card/40 hover:bg-accent/40"}`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Photos</Label>
          <div className="flex flex-wrap gap-3">
            {images.map((src, i) => (
              <div key={src} className="relative h-24 w-24 overflow-hidden rounded-xl">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-background/80 p-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-card/40 text-xs text-muted-foreground hover:bg-accent/30">
              <Upload className="h-4 w-4" />
              {uploading ? "…" : "Add"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/50 bg-card/40 p-4">
          <div>
            <p className="font-medium">Visible in store</p>
            <p className="text-xs text-muted-foreground">Turn off to save as a draft.</p>
          </div>
          <Switch checked={active} onCheckedChange={setActive} />
        </div>

        <Button type="submit" size="lg" disabled={saving} className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
          {saving ? "Saving…" : "Add product"}
        </Button>
      </form>
    </div>
  );
}
