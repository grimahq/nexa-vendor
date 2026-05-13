import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShoppingBag, MessageCircle, Receipt, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { MeshBackground } from "@/components/MeshBackground";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexa Vendors — Sell on WhatsApp like a brand" },
      { name: "description", content: "The all-in-one storefront for WhatsApp vendors, affiliate marketers and food sellers. Catalog, payments, orders and KYC verification — all in one link." },
      { property: "og:title", content: "Nexa Vendors — Sell on WhatsApp like a brand" },
      { property: "og:description", content: "Build your store in 60 seconds. Share product links with one tap. Get paid via Moniepoint." },
    ],
  }),
  component: HomePage,
});

const features = [
  { icon: ShoppingBag, title: "Branded micro-store", body: "Logo, colors, catalog — your shop in 60 seconds." },
  { icon: Sparkles, title: "Smart product links", body: "Auto-written CTAs and an animated buy button on every product." },
  { icon: Receipt, title: "Moniepoint payments", body: "Plug your Moniepoint link and get paid straight to your account." },
  { icon: MessageCircle, title: "WhatsApp follow-ups", body: "Tap once to message a customer with a templated reply." },
  { icon: ShieldCheck, title: "Verified badge", body: "Pass KYC once. Earn buyer trust forever." },
];

function HomePage() {
  return (
    <div className="dark relative min-h-screen bg-background text-foreground">
      <MeshBackground />
      <SiteHeader />

      <main className="relative">
        <section className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs backdrop-blur"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            New — Moniepoint payments now in beta
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
          >
            Sell on WhatsApp <br />
            like a <span className="text-gradient">real brand.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground"
          >
            Catalog, checkout, receipts and customer follow-ups —
            all behind one shareable link. Built for Nigerian vendors,
            food sellers and affiliate marketers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
              <Link to="/signup">
                Claim your store <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border/60 bg-card/40 backdrop-blur">
              <Link to="/explore">See live stores</Link>
            </Button>
          </motion.div>

          <p className="mt-4 text-xs text-muted-foreground">Free to start · No card required · KYC unlocks the verified badge</p>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 pb-32 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.05 }}
                className="card-3d glass rounded-3xl p-6 shadow-soft"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Nexa Digital Solutions
      </footer>
    </div>
  );
}
