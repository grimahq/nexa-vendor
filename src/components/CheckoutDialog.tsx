import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2, CreditCard, MessageCircle, Check, ShieldCheck,
  Receipt, ArrowRight, ArrowLeft, Truck, MapPin,
} from "lucide-react";
import { buildCheckoutUrl } from "@/integrations/moniepoint";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  store: { id: string; name: string; whatsapp: string | null };
  product: { id: string; title: string; sell_price: number; slug: string };
  qty: number;
};

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Your details",
  2: "Payment & confirm",
  3: "Done",
};

export function CheckoutDialog({ open, onOpenChange, store, product, qty }: Props) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [trackToken, setTrackToken] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const total = qty * Number(product.sell_price);

  function next() {
    if (step === 1) {
      if (!name.trim() || !phone.trim()) return toast.error("Name and phone required");
      if (fulfillment === "delivery" && !address.trim()) return toast.error("Delivery address required");
      setStep(2);
    }
  }

  async function placeOrder(mode: "advance" | "whatsapp") {
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

    setOrderId(data.id);
    setTrackToken(data.tracking_token);
    const trackUrl = `${window.location.origin}/track/${data.tracking_token}`;

    if (mode === "advance") {
      const url = buildCheckoutUrl({
        amount: total,
        reference: data.id,
        customer: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined },
        redirectUrl: trackUrl,
        merchantCode: store.id,
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (store.whatsapp) {
      const msg = encodeURIComponent(
        `Hi ${store.name}, I just placed an order:\n${qty}× ${product.title}\nTotal: ₦${total.toLocaleString()}\nName: ${name}\nTrack: ${trackUrl}`,
      );
      window.open(`https://wa.me/${store.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank", "noopener,noreferrer");
    }
    setStep(3);
  }

  function reset() {
    setStep(1); setOrderId(null); setTrackToken(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto bg-card p-0 sm:max-w-md">
        <DialogHeader className="border-b border-border/60 px-6 pb-4 pt-6">
          <DialogTitle className="font-display text-2xl tracking-tight">{STEP_LABELS[step]}</DialogTitle>
          {/* progress segments */}
          <div className="mt-4 flex items-center gap-2">
            {([1, 2, 3] as Step[]).map((s) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <motion.div
                  className="h-1.5 flex-1 rounded-full bg-muted"
                  animate={{ backgroundColor: s <= step ? "oklch(0.62 0.18 255)" : "oklch(0.92 0.008 240)" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))}
          </div>
          {/* order summary chip — sticky context */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground text-base font-bold shadow-glow">
              {qty}×
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.title}</p>
              <p className="text-[11px] text-muted-foreground">{store.name}</p>
            </div>
            <p className="font-display text-lg font-bold text-primary">₦{total.toLocaleString()}</p>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="grid gap-1.5">
                  <Label>Full name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aisha Mohammed" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>WhatsApp</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0801…" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Email <span className="text-muted-foreground">(opt.)</span></Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@…" />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Fulfillment</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: "pickup" as const, label: "Pickup", icon: MapPin },
                      { key: "delivery" as const, label: "Delivery", icon: Truck },
                    ]).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFulfillment(key)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                          fulfillment === key
                            ? "border-primary bg-primary/10 text-primary shadow-soft"
                            : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {fulfillment === "delivery" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-1.5">
                    <Label>Delivery address</Label>
                    <Textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House number, street, city…" rows={2} />
                  </motion.div>
                )}

                <div className="grid gap-1.5">
                  <Label>Notes <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Color, size, special requests…" rows={2} />
                </div>

                <Button onClick={next} size="lg" className="mt-2 h-12 w-full bg-gradient-primary text-base text-primary-foreground shadow-glow hover:opacity-90">
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">Choose how you'd like to pay.</p>

                {/* Pay in advance */}
                <button
                  onClick={() => placeOrder("advance")}
                  disabled={submitting}
                  className="group relative w-full overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary-glow/5 p-5 text-left transition-all hover:border-primary hover:shadow-glow disabled:opacity-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-base font-semibold">Pay in advance</p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success">
                          <ShieldCheck className="h-3 w-3" /> Secure
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Pay with Moniepoint now. Receipt is generated automatically and shared with the seller.
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 self-center text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                </button>

                {/* Confirm on WhatsApp */}
                <button
                  onClick={() => placeOrder("whatsapp")}
                  disabled={submitting || !store.whatsapp}
                  className="group w-full rounded-2xl border border-border/60 bg-background p-5 text-left transition-all hover:border-border hover:bg-muted/40 disabled:opacity-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-base font-semibold">Confirm on WhatsApp</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Reserve now, settle with the seller in chat. {!store.whatsapp && "(seller has no WhatsApp yet)"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 self-center text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </button>

                {submitting && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing your order…
                  </div>
                )}

                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="w-full text-muted-foreground">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
              </motion.div>
            )}

            {step === 3 && trackToken && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 py-2 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
                >
                  <Check className="h-8 w-8" strokeWidth={3} />
                </motion.div>
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">Order placed</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Order #{orderId?.slice(0, 8)} — tracking link saved.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Button
                    size="lg"
                    className="h-12 w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90"
                    onClick={() => {
                      onOpenChange(false);
                      nav({ to: "/track/$token", params: { token: trackToken } });
                    }}
                  >
                    <Receipt className="mr-2 h-4 w-4" /> View receipt & track
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 w-full"
                    onClick={() => {
                      const url = `${window.location.origin}/track/${trackToken}`;
                      navigator.clipboard.writeText(url);
                      toast.success("Tracking link copied");
                    }}
                  >
                    Copy tracking link
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
