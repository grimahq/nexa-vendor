import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ShoppingBag, CreditCard } from "lucide-react";
import { buildCheckoutUrl } from "@/integrations/moniepoint";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  store: { id: string; name: string; whatsapp: string | null };
  product: { id: string; title: string; sell_price: number; slug: string };
  qty: number;
};

export function CheckoutDialog({ open, onOpenChange, store, product, qty }: Props) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const total = qty * Number(product.sell_price);

  async function placeOrder(payNow: boolean) {
    if (!name.trim() || !phone.trim()) return toast.error("Name and phone required");
    if (fulfillment === "delivery" && !address.trim()) return toast.error("Delivery address required");
    setSubmitting(true);
    const { data, error } = await supabase
      .from("orders")
      .insert({
        store_id: store.id,
        buyer_id: user?.id ?? null,
        buyer_name: name.trim(),
        buyer_phone: phone.trim(),
        buyer_email: email.trim() || null,
        items: [{ product_id: product.id, title: product.title, qty, price: Number(product.sell_price) }],
        subtotal: total,
        total,
        fulfillment,
        address: fulfillment === "delivery" ? address.trim() : null,
        notes: notes.trim() || null,
      })
      .select("id, tracking_token")
      .single();
    setSubmitting(false);
    if (error || !data) return toast.error(error?.message ?? "Could not place order");
    toast.success("Order placed! Redirecting…");
    const trackUrl = `${window.location.origin}/track/${data.tracking_token}`;
    if (payNow) {
      // Moniepoint hosted checkout (stub URL until credentials arrive)
      const url = buildCheckoutUrl({
        amount: total,
        reference: data.id,
        customer: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined },
        redirectUrl: trackUrl,
        merchantCode: store.id, // until vendor sets a real Moniepoint code
      });
      window.open(url, "_blank");
    } else if (store.whatsapp) {
      const msg = encodeURIComponent(
        `Hi ${store.name}, I just placed an order:\n${qty}× ${product.title}\nTotal: ₦${total.toLocaleString()}\nName: ${name}\nTrack: ${trackUrl}`,
      );
      window.open(`https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
    }
    nav({ to: "/track/$token", params: { token: data.tracking_token } });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark max-h-[92vh] overflow-y-auto bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Complete your order</DialogTitle>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
            <p className="text-xs text-muted-foreground">Order summary</p>
            <p className="mt-1 text-sm">{qty}× {product.title}</p>
            <p className="mt-1 font-display text-xl font-bold text-primary">₦{total.toLocaleString()}</p>
          </div>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="grid gap-1.5">
              <Label>WhatsApp / phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0801…" />
            </div>
            <div className="grid gap-1.5">
              <Label>Email (optional)</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>

            <div>
              <Label className="mb-2 block">Fulfillment</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["pickup", "delivery"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFulfillment(f)}
                    className={`rounded-xl border px-3 py-2.5 text-sm capitalize transition-colors ${fulfillment === f ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:text-foreground"}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {fulfillment === "delivery" && (
              <div className="grid gap-1.5">
                <Label>Delivery address</Label>
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House number, street, city…" rows={2} />
              </div>
            )}

            <div className="grid gap-1.5">
              <Label>Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Color, size, special requests…" rows={2} />
            </div>
          </div>

          <div className="grid gap-2">
            <Button
              onClick={() => placeOrder(false)}
              disabled={submitting}
              size="lg"
              className="h-12 w-full bg-gradient-primary text-base text-primary-foreground shadow-glow hover:opacity-90"
            >
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingBag className="mr-2 h-4 w-4" />}
              Place order · ₦{total.toLocaleString()}
            </Button>
            <Button
              onClick={() => placeOrder(true)}
              disabled={submitting}
              size="lg"
              variant="outline"
              className="h-12 w-full border-border/60 bg-card/40 text-base backdrop-blur"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay in advance with Moniepoint
            </Button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground">
            Pay-now opens a secure Moniepoint checkout. Or place the order and confirm on WhatsApp.
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
