import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import {
  ArrowRight, Sparkles, ShoppingBag, MessageCircle, Receipt, ShieldCheck,
  Zap, Star, Check, Github, Send, Heart, TrendingUp,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { MeshBackground } from "@/components/MeshBackground";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import heroPhone from "@/assets/hero-phone-3d.png";
import phonesRow from "@/assets/phones-row-3d.png";
import featurePhone from "@/assets/feature-catalog-3d.png";
import { StackingProjects } from "@/components/StackingProjects";
import { VerifiedMarquee } from "@/components/VerifiedMarquee";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexa Vendors — Sell on WhatsApp like a real brand" },
      { name: "description", content: "All-in-one storefront for WhatsApp vendors, food sellers and affiliate marketers in Nigeria. Catalog, payments, KYC and orders behind one shareable link." },
      { property: "og:title", content: "Nexa Vendors — Sell on WhatsApp like a real brand" },
      { property: "og:description", content: "Build your verified store in 60 seconds. Catalog, Moniepoint checkout, customer follow-ups." },
    ],
  }),
  component: HomePage,
});

const FLOAT = (delay = 0) => ({
  y: [0, -14, 0],
  transition: { duration: 6 + delay, repeat: Infinity, ease: "easeInOut" as const, delay },
});

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground/80 backdrop-blur">
      {children}
    </span>
  );
}

function SectionHeading({ tag, children }: { tag: string; children: React.ReactNode }) {
  return (
    <div className="mb-12 flex flex-col items-center text-center">
      <Badge>{tag}</Badge>
      <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {children}
      </h2>
    </div>
  );
}

function HomePage() {
  const reduce = useReducedMotion();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <MeshBackground />
      <SiteHeader />

      {/* ===== HERO ===== */}
      <section className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* copy */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs backdrop-blur"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Nexa Vendors · Built for WhatsApp sellers
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Turn Your WhatsApp <br className="hidden sm:block" />
              Into a <span className="text-gradient">Real Brand</span> ✨
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-6 max-w-xl text-balance text-lg text-muted-foreground lg:mx-0"
            >
              Stop losing customers in chat. Build a verified storefront,
              accept Moniepoint payments and follow up like a pro —
              all behind one shareable link.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-10 flex flex-col items-center gap-3 sm:flex-row lg:items-start lg:justify-start"
            >
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/signup">
                  Claim your store <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border/60 bg-card/40 backdrop-blur">
                <Link to="/explore">View live stores</Link>
              </Button>
            </motion.div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground lg:justify-start">
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary-glow" /> 60-second setup</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary-glow" /> KYC verified badge</div>
              <div className="flex items-center gap-2"><Receipt className="h-4 w-4 text-primary-glow" /> One-time payment</div>
            </div>
          </div>

          {/* 3D phone */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative mx-auto h-[420px] w-full max-w-[520px] sm:h-[520px]"
          >
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-primary opacity-60 blur-3xl" />
            </div>
            {/* floating dots */}
            {!reduce && (
              <>
                <motion.span animate={FLOAT(0.2)} className="absolute left-4 top-10 h-3 w-3 rounded-full bg-primary-glow shadow-glow" />
                <motion.span animate={FLOAT(0.8)} className="absolute right-8 top-24 h-2 w-2 rounded-full bg-chart-5" />
                <motion.span animate={FLOAT(1.4)} className="absolute bottom-16 left-10 h-4 w-4 rounded-full bg-accent" />
                <motion.span animate={FLOAT(0.5)} className="absolute bottom-6 right-16 h-2.5 w-2.5 rounded-full bg-primary" />
              </>
            )}
            <motion.img
              src={heroPhone}
              alt="Nexa Vendors storefront on a phone"
              width={1024}
              height={1024}
              className="relative z-10 mx-auto h-full w-auto drop-shadow-[0_30px_60px_rgba(124,58,237,0.45)]"
              animate={reduce ? undefined : { y: [0, -10, 0], rotate: [-2, 1, -2] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* product card floating */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -left-2 bottom-12 z-20 hidden w-56 rounded-2xl border border-border/60 bg-card/80 p-3 shadow-elevated backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-lg">🍔</div>
                <div>
                  <p className="text-xs text-muted-foreground">New order · ₦4,500</p>
                  <p className="text-sm font-semibold">Jollof Combo × 2</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== TRUST BAR ===== */}
      <section className="border-y border-border/40 bg-card/20 py-6 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">5,000+ vendors</span> selling smarter with Nexa
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="opacity-70">FOOD</span>
            <span className="opacity-70">FASHION</span>
            <span className="opacity-70">BEAUTY</span>
            <span className="opacity-70">AFFILIATES</span>
            <span className="opacity-70">THRIFT</span>
          </div>
        </div>
      </section>

      {/* ===== PAIN POINTS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeading tag="The Pain Points">
          Selling on WhatsApp <span className="text-gradient">shouldn't hurt</span>
        </SectionHeading>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { emoji: "😩", title: "Customers ghost your DMs", body: "“How much?” then silence. You're stuck negotiating one chat at a time with no catalog." },
            { emoji: "💸", title: "Payment trust is broken", body: "Buyers fear scams. Random account numbers in chat feel sketchy and lose you sales." },
            { emoji: "📦", title: "Orders live in your head", body: "Screenshots, sticky notes, lost addresses. You forget who paid, who's pending, who to follow up." },
          ].map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-3d glass rounded-3xl p-6 shadow-soft"
            >
              <div className="text-4xl">{p.emoji}</div>
              <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== STACKING PROJECTS ===== */}
      <StackingProjects />

      {/* ===== VERIFIED BRANDS — floating marquee ===== */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 flex flex-col items-center text-center">
          <Badge>Verified on Nexa</Badge>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Our recent <span className="text-gradient">verified brands</span>
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Real Nigerian vendors running their entire WhatsApp business on Nexa.
          </p>
        </div>
        <VerifiedMarquee />
        <div className="mt-10 flex justify-center">
          <Button asChild variant="outline" className="border-border/60 bg-card/40 backdrop-blur">
            <Link to="/explore">See all verified stores <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>


      {/* ===== FEATURE — VENDORS ===== */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge>Nexa — for Vendors</Badge>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              The storefront <span className="text-gradient">your DMs deserve</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              A branded micro-store with your logo, catalog and checkout.
              Share one link in your WhatsApp status and let it sell while you sleep.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Branded catalog with photos & prices",
                "Automatic order receipts via WhatsApp",
                "Stock counters and emoji-rich product cards",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-gradient-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <Link to="/signup">Free register <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[420px]"
          >
            <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-primary opacity-50 blur-3xl" />
            <motion.img
              src={featurePhone}
              alt="Vendor catalog interface"
              width={900}
              height={900}
              loading="lazy"
              className="relative z-10 mx-auto h-full w-auto drop-shadow-[0_30px_60px_rgba(124,58,237,0.4)]"
              animate={reduce ? undefined : { y: [0, -12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURE — BUYERS ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 relative h-[360px] lg:order-1"
          >
            <img
              src={phonesRow}
              alt="Buyer app screens"
              width={1600}
              height={900}
              loading="lazy"
              className="absolute inset-0 m-auto h-auto w-full max-w-2xl drop-shadow-[0_30px_60px_rgba(124,58,237,0.35)]"
            />
          </motion.div>
          <div className="order-1 lg:order-2">
            <Badge>Nexa — for Buyers</Badge>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Follow, like, order — <span className="text-gradient">track everything</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Save your favourite vendors. Comment on products. Track every order
              from confirmed to delivered — no account required for one-off pickups.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                { icon: Heart, txt: "Follow vendors and like products" },
                { icon: TrendingUp, txt: "See top sellers per category" },
                { icon: MessageCircle, txt: "Chat the vendor in one tap" },
              ].map((f) => (
                <li key={f.txt} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-accent/40">
                    <f.icon className="h-4 w-4 text-primary-glow" />
                  </span>
                  {f.txt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== VERIFIED BADGE ===== */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/50 p-10 backdrop-blur-xl sm:p-14"
        >
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge>Trust Layer</Badge>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Earn the <span className="text-gradient">Verified Badge</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Buyers pay faster when they see the blue check. Submit your NIN
                and business details once — our team reviews within 24 hours.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-success" /> Higher placement in Explore</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-success" /> "Verified seller" badge on every product</li>
                <li className="flex items-center gap-3"><Check className="h-4 w-4 text-success" /> Buyer trust score on your storefront</li>
              </ul>
              <Button asChild className="mt-8 bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                <Link to="/verify">Start KYC <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="relative grid h-[300px] place-items-center">
              <motion.div
                animate={reduce ? undefined : { rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute h-64 w-64 rounded-full border border-dashed border-primary/40"
              />
              <motion.div
                animate={reduce ? undefined : { rotate: [360, 0] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute h-48 w-48 rounded-full border border-dashed border-primary-glow/40"
              />
              <motion.div
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative grid h-32 w-32 place-items-center rounded-full bg-gradient-primary shadow-glow"
              >
                <ShieldCheck className="h-14 w-14 text-primary-foreground" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeading tag="Pricing Plan">
          Start with an <span className="text-gradient">affordable price</span>
        </SectionHeading>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-3d glass rounded-3xl p-8 shadow-soft"
          >
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-muted-foreground">
              <ShoppingBag className="h-4 w-4" /> STARTER PLAN
            </div>
            <p className="mt-6 font-display text-5xl font-bold">Free <span className="text-base font-normal text-muted-foreground">/ forever</span></p>
            <p className="mt-2 text-sm text-muted-foreground">Up to 20 products. Perfect to test the waters.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Branded storefront", "Up to 20 products", "WhatsApp checkout", "Order tracking links"].map((t) => (
                <li key={t} className="flex items-center gap-3"><Check className="h-4 w-4 text-success" />{t}</li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8 w-full">
              <Link to="/signup">Register now</Link>
            </Button>
          </motion.div>
          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="card-3d relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-card to-accent/20 p-8 shadow-glow"
          >
            <div className="absolute right-4 top-4 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
              20% OFF
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary-glow">
              👑 PRO PLAN
            </div>
            <p className="mt-6 font-display text-5xl font-bold">₦2,500 <span className="text-base font-normal text-muted-foreground">/ month</span></p>
            <p className="mt-2 text-sm text-muted-foreground">Unlimited everything + verified badge priority.</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Unlimited products", "Moniepoint payments", "Verified badge fast-track", "Customer CRM & follow-ups", "Top placement in Explore"].map((t) => (
                <li key={t} className="flex items-center gap-3"><Check className="h-4 w-4 text-success" />{t}</li>
              ))}
            </ul>
            <Button asChild className="mt-8 w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <Link to="/signup">Get Pro</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionHeading tag="Frequently Asked Question">
          Need a <span className="text-gradient">support?</span>
        </SectionHeading>
        <div className="mx-auto grid max-w-5xl gap-x-6 md:grid-cols-2">
          {[
            { q: "How do I set up my store?", a: "Sign up, name your store, upload a logo and add your WhatsApp number. You'll have a shareable link in under 60 seconds." },
            { q: "How does Moniepoint payment work?", a: "Drop your Moniepoint sub-account link in settings. Every product card auto-renders a 'Pay now' button that opens it." },
            { q: "Is there a verified badge?", a: "Yes — submit your NIN, a selfie and one business doc. Our team reviews within 24 hours and your store gets the blue check." },
            { q: "Can I lock my catalog or hide stock?", a: "Absolutely. Toggle products live/draft anytime and hide stock counts from buyers in settings." },
            { q: "Do buyers need an account to order?", a: "No. Guests check out with name + WhatsApp number. They get a tracking link to follow status updates live." },
            { q: "How is my data stored?", a: "Encrypted at rest and in transit on Lovable Cloud. Only you can see your orders and customer list." },
            { q: "Can I use Nexa for affiliate marketing?", a: "Yes. Add affiliate links as products — every share goes through your branded link with click tracking coming soon." },
            { q: "What happens if I cancel?", a: "Your storefront stays live on the free plan with the 20-product limit. Re-upgrade anytime — no data lost." },
          ].map((f, i) => (
            <Accordion key={f.q} type="single" collapsible className="mb-3">
              <AccordionItem value={`q-${i}`} className="glass rounded-2xl border border-border/40 px-5">
                <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </section>

      {/* ===== COMMUNITY HUB ===== */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading tag="Nexa Community">
          Join into <span className="text-gradient">our hub</span>
        </SectionHeading>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass mx-auto grid max-w-4xl gap-6 rounded-3xl p-6 sm:grid-cols-3 sm:gap-0 sm:p-8"
        >
          {[
            { icon: MessageCircle, title: "WhatsApp", body: "Vendor tips & weekly drops", href: "#" },
            { icon: Send, title: "Telegram", body: "Announcements & beta access", href: "#" },
            { icon: Github, title: "Help center", body: "Guides & tutorials", href: "#" },
          ].map((c, i) => (
            <a
              key={c.title}
              href={c.href}
              className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-accent/30 sm:px-6 sm:[&:not(:last-child)]:border-r sm:border-border/40"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-110">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.body}</p>
              </div>
            </a>
          ))}
        </motion.div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
        <Badge>Ready when you are</Badge>
        <h2 className="mt-4 font-display text-5xl font-bold tracking-tight sm:text-6xl">
          Start <span className="text-gradient">selling</span> today
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          From Sapele to Surulere — your shoppable WhatsApp link is one click away.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
            <Link to="/signup">Claim your store <Sparkles className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-border/60 bg-card/40 backdrop-blur">
            <Link to="/explore">Browse vendors</Link>
          </Button>
        </div>
        <div className="mt-8 flex items-center justify-center gap-1 text-sm text-muted-foreground">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-warning text-warning" />)}
          <span className="ml-2">Loved by 5,000+ Nigerian vendors</span>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/40 bg-card/20 py-10 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Nexa Digital Solutions
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <Link to="/explore" className="hover:text-foreground">Explore</Link>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <Link to="/login" className="hover:text-foreground">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
