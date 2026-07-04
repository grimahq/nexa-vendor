import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Check, ChevronRight, Menu, X, ShieldCheck, Zap, MessageCircle,
  ShoppingBag, Sparkles, Store, Receipt, Facebook, Instagram, Twitter, Youtube,
  Plus, Minus, ShoppingCart, Star,
} from "lucide-react";
import { toast } from "sonner";
import { joinWaitlist } from "@/lib/waitlist.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexa Vendors — Turn your WhatsApp into a real brand" },
      { name: "description", content: "Nigeria's #1 WhatsApp vendor platform. Verified storefronts, secure payments, order tracking. 5,000+ vendors trust Nexa." },
      { property: "og:title", content: "Nexa Vendors — Turn your WhatsApp into a real brand" },
      { property: "og:description", content: "Verified storefronts, secure payments, and follow-ups for Nigerian WhatsApp vendors." },
    ],
  }),
  component: HomePage,
});

/* ------------------------------------------------------------------ */
/* Local design tokens (dark navy + teal) — scoped to landing page     */
/* ------------------------------------------------------------------ */
const NAVY_BG = "bg-[#0a1628]";
const NAVY_DEEP = "bg-[#060f1e]";
const TEAL = "text-[#2dd4bf]";
const TEAL_BG = "bg-[#14b8a6]";
const TEAL_BG_HOVER = "hover:bg-[#0d9488]";
const TEAL_BORDER = "border-[#2dd4bf]";

/* ------------------------------------------------------------------ */
/* Scroll-aware Navbar                                                 */
/* ------------------------------------------------------------------ */
function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = [
    { label: "Home", href: "#top" },
    { label: "Explore", href: "/explore" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0a1628]/85 backdrop-blur-md border-b border-white/10"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#2dd4bf] to-[#14b8a6] text-[#0a1628] font-black shadow-[0_0_30px_-8px_#2dd4bf]">
              N
            </div>
            <span className="font-display text-lg font-bold text-white">
              Nexa<span className="text-[#2dd4bf]">Vendors</span>
            </span>
          </Link>

          {/* Center nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-sm text-white/70 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/login"
              className="rounded-md px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className={`rounded-md ${TEAL_BG} ${TEAL_BG_HOVER} px-4 py-2 text-sm font-semibold text-[#0a1628] shadow-[0_8px_24px_-8px_#2dd4bf] transition-all hover:shadow-[0_12px_32px_-8px_#2dd4bf]`}
            >
              Start selling
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-lg text-white md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-[#060f1e]/95 backdrop-blur-xl transition-transform duration-500 ${
            open ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex h-full flex-col items-center justify-center gap-8 px-6 pt-16">
            {links.map((l, i) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-3xl font-bold text-white transition-all hover:text-[#2dd4bf]"
                style={{
                  animation: open ? `slideDown 0.5s ease-out ${i * 0.05}s both` : "none",
                }}
              >
                {l.label}
              </a>
            ))}
            <div className="mt-6 flex w-full max-w-xs flex-col gap-3">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="w-full rounded-md border border-white/20 px-4 py-3 text-center text-sm font-medium text-white"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className={`w-full rounded-md ${TEAL_BG} px-4 py-3 text-center text-sm font-semibold text-[#0a1628]`}
              >
                Start selling
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* CountUp hook — IntersectionObserver + rAF                           */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setValue(Math.round(target * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);

  return { ref, value };
}

function Stat({ value, suffix, prefix, label }: {
  value: number; suffix?: string; prefix?: string; label: string;
}) {
  const { ref, value: n } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl font-black text-[#0a1628] sm:text-5xl">
        {prefix}{n.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-sm font-medium text-[#0a1628]/70">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Interactive demo (buyer catalog)                                    */
/* ------------------------------------------------------------------ */
type DemoItem = { id: string; name: string; price: number; emoji: string; tag: string };
const DEMO_PRODUCTS: DemoItem[] = [
  { id: "p1", name: "Jollof Combo", price: 4500, emoji: "🍛", tag: "Bestseller" },
  { id: "p2", name: "Silk Bonnet", price: 3200, emoji: "💇🏾‍♀️", tag: "New" },
  { id: "p3", name: "Ankara Set", price: 12500, emoji: "👗", tag: "Trending" },
];

function InteractiveDemo() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [flying, setFlying] = useState<string | null>(null);

  const total = useMemo(
    () => DEMO_PRODUCTS.reduce((s, p) => s + (cart[p.id] ?? 0) * p.price, 0),
    [cart],
  );
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const add = (id: string) => {
    setFlying(id);
    setTimeout(() => setFlying(null), 600);
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  };
  const dec = (id: string) =>
    setCart((c) => {
      const n = (c[id] ?? 0) - 1;
      const next = { ...c };
      if (n <= 0) delete next[id]; else next[id] = n;
      return next;
    });

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 sm:grid-cols-3">
          {DEMO_PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1628]/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#2dd4bf]/40"
            >
              <div className="absolute right-3 top-3 rounded-full bg-[#2dd4bf]/15 px-2 py-0.5 text-[10px] font-semibold text-[#2dd4bf]">
                {p.tag}
              </div>
              <div className="grid h-24 place-items-center text-5xl">{p.emoji}</div>
              <div className="mt-4 font-semibold text-white">{p.name}</div>
              <div className="mt-1 text-sm text-white/60">₦{p.price.toLocaleString()}</div>
              <button
                onClick={() => add(p.id)}
                className={`relative mt-4 w-full overflow-hidden rounded-lg ${TEAL_BG} ${TEAL_BG_HOVER} py-2 text-sm font-semibold text-[#0a1628] transition-transform active:scale-95`}
              >
                Add to Cart
                {flying === p.id && (
                  <span className="pointer-events-none absolute inset-0 grid place-items-center text-[#0a1628]"
                    style={{ animation: "flyToCart 0.6s ease-out forwards" }}>
                    <Plus className="h-5 w-5" />
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Cart */}
        <div className="rounded-2xl border border-[#2dd4bf]/30 bg-gradient-to-br from-[#0a1628] to-[#060f1e] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <ShoppingCart className="h-4 w-4 text-[#2dd4bf]" />
              <span className="text-sm font-semibold">Your cart</span>
            </div>
            <div className={`grid h-6 min-w-[24px] place-items-center rounded-full ${TEAL_BG} px-2 text-xs font-bold text-[#0a1628] transition-transform ${count > 0 ? "scale-100" : "scale-0"}`}>
              {count}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {Object.keys(cart).length === 0 ? (
              <p className="py-6 text-center text-xs text-white/50">Tap "Add to Cart" to try it out</p>
            ) : (
              DEMO_PRODUCTS.filter((p) => cart[p.id]).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-white/5 p-2 text-sm text-white">
                  <span className="truncate">{p.emoji} {p.name}</span>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => dec(p.id)} className="grid h-6 w-6 place-items-center rounded bg-white/10 hover:bg-white/20"><Minus className="h-3 w-3" /></button>
                    <span className="w-4 text-center text-xs">{cart[p.id]}</span>
                    <button onClick={() => add(p.id)} className="grid h-6 w-6 place-items-center rounded bg-white/10 hover:bg-white/20"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Total</span>
              <span className="font-display text-2xl font-bold text-[#2dd4bf] tabular-nums">
                ₦{total.toLocaleString()}
              </span>
            </div>
            <button className={`mt-4 w-full rounded-lg ${TEAL_BG} ${TEAL_BG_HOVER} py-2.5 text-sm font-semibold text-[#0a1628] disabled:opacity-50`} disabled={count === 0}>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Waitlist                                                             */
/* ------------------------------------------------------------------ */
function WaitlistForm() {
  const join = useServerFn(joinWaitlist);
  const mutation = useMutation({
    mutationFn: (input: { name: string; email: string; phone: string; business_type: string; note: string }) =>
      join({ data: input }),
    onSuccess: (res) => {
      if (res.duplicate) toast.success("You're already on the list ✨");
      else toast.success("You're in! We'll reach out soon.");
    },
    onError: (e: Error) => toast.error(e.message ?? "Something went wrong"),
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", business_type: "", note: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const done = mutation.isSuccess;

  return (
    <form onSubmit={submit} className="rounded-3xl border border-[#2dd4bf]/30 bg-white/5 p-6 backdrop-blur-xl sm:p-10">
      {done ? (
        <div className="py-8 text-center">
          <div className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${TEAL_BG} shadow-[0_0_40px_-4px_#2dd4bf]`}>
            <Check className="h-8 w-8 text-[#0a1628]" />
          </div>
          <h3 className="mt-6 font-display text-2xl font-bold text-white">You're on the list</h3>
          <p className="mt-2 text-sm text-white/60">We'll email you when your onboarding slot opens.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Ada Obi" />
            </Field>
            <Field label="Email" required>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} placeholder="you@brand.com" />
            </Field>
            <Field label="WhatsApp number">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="+234…" />
            </Field>
            <Field label="What do you sell?">
              <select value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} className={inputCls}>
                <option value="">Select category</option>
                {["Food", "Fashion", "Beauty", "Thrift", "Affiliate", "Other"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Anything else? (optional)">
            <textarea rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={`${inputCls} resize-none`} placeholder="Tell us about your business…" />
          </Field>
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`mt-6 w-full rounded-xl ${TEAL_BG} ${TEAL_BG_HOVER} py-3.5 text-sm font-bold text-[#0a1628] shadow-[0_10px_30px_-8px_#2dd4bf] transition-all disabled:opacity-60`}
          >
            {mutation.isPending ? "Joining…" : "Join the waitlist"}
          </button>
          <p className="mt-3 text-center text-xs text-white/50">No spam. Unsubscribe anytime.</p>
        </>
      )}
    </form>
  );
}

const inputCls =
  "mt-1.5 w-full rounded-lg border border-white/10 bg-[#060f1e]/60 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#2dd4bf] focus:ring-2 focus:ring-[#2dd4bf]/20";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
        {label}{required && <span className="text-[#2dd4bf]"> *</span>}
      </span>
      {children}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Landing Page                                                         */
/* ------------------------------------------------------------------ */
function HomePage() {
  return (
    <div id="top" className={`${NAVY_BG} text-white`}>
      {/* Local keyframes */}
      <style>{`
        @keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes floatCard { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(1deg); } }
        @keyframes tickerX { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes phoneScroll { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
        @keyframes flyToCart { 0% { opacity: 1; transform: scale(1) translate(0,0); } 100% { opacity: 0; transform: scale(0.3) translate(120px,-80px); } }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(45,212,191,0.5); } 100% { box-shadow: 0 0 0 20px rgba(45,212,191,0); } }
        .anim-float { animation: floatY 4s ease-in-out infinite; }
        .anim-float-card { animation: floatCard 6s ease-in-out infinite; }
        .anim-ticker { animation: tickerX 40s linear infinite; }
        .anim-phone-scroll { animation: phoneScroll 18s linear infinite; }
        .anim-fade-up { animation: fadeUp 0.7s ease-out both; }
        .anim-pulse-ring { animation: pulseRing 2s ease-out infinite; }
      `}</style>

      <LandingNav />

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen overflow-hidden pt-16">
        {/* mesh + grid backdrop */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#14b8a6]/20 blur-[120px]" />
          <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#3b82f6]/15 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }} />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24">
          {/* LEFT */}
          <div className="anim-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-4 py-1.5 text-xs font-medium text-[#2dd4bf]">
              <span className="relative grid h-2 w-2 place-items-center">
                <span className="absolute h-2 w-2 rounded-full bg-[#2dd4bf] anim-pulse-ring" />
                <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
              </span>
              Nigeria's #1 WhatsApp vendor platform
            </div>

            <h1 className="mt-6 font-display text-5xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Turn your <br />
              <span className="bg-gradient-to-r from-white via-white to-[#2dd4bf] bg-clip-text text-transparent">WhatsApp</span> into a<br />
              <span className="text-[#2dd4bf]">real brand.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg text-white/70">
              Verified storefronts, secure payments and follow-ups —
              all behind one shareable link built for Nigerian vendors.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signup"
                className={`inline-flex items-center justify-center gap-2 rounded-xl ${TEAL_BG} ${TEAL_BG_HOVER} px-7 py-3.5 text-sm font-bold text-[#0a1628] shadow-[0_10px_40px_-8px_#2dd4bf] transition-all hover:-translate-y-0.5`}
              >
                Claim your store <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
              >
                See live demo
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/50">
              60-second setup <span className="text-[#2dd4bf]">·</span> Free to start <span className="text-[#2dd4bf]">·</span> 5,000+ vendors
            </p>
          </div>

          {/* RIGHT — phone mockup */}
          <div className="relative mx-auto h-[560px] w-full max-w-[380px]">
            {/* Ambient glow */}
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#2dd4bf]/40 to-[#3b82f6]/20 blur-3xl" />

            {/* Phone frame */}
            <div className="anim-float relative mx-auto h-[560px] w-[280px] rounded-[3rem] border-[10px] border-[#0a1628] bg-[#060f1e] shadow-[0_40px_80px_-20px_#000] ring-1 ring-white/10">
              {/* Notch */}
              <div className="absolute left-1/2 top-2 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-[#0a1628]" />

              {/* Screen */}
              <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-gradient-to-b from-[#0a1628] to-[#060f1e]">
                {/* Store header */}
                <div className="sticky top-0 z-10 border-b border-white/5 bg-[#0a1628]/95 px-4 py-3 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <div className={`grid h-8 w-8 place-items-center rounded-full ${TEAL_BG} text-xs font-black text-[#0a1628]`}>A</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-xs font-bold text-white">Ada's Kitchen <ShieldCheck className="h-3 w-3 text-[#2dd4bf]" /></div>
                      <div className="text-[10px] text-white/50">4.9 ★ · 2.1k orders</div>
                    </div>
                  </div>
                </div>

                {/* Scrolling catalog */}
                <div className="anim-phone-scroll">
                  {[...Array(2)].map((_, dup) => (
                    <div key={dup} className="space-y-3 p-3">
                      {[
                        { e: "🍛", n: "Jollof Combo", p: "₦4,500", t: "Bestseller" },
                        { e: "🍗", n: "Grilled Chicken", p: "₦6,800", t: "New" },
                        { e: "🥘", n: "Egusi Special", p: "₦3,900", t: "Hot" },
                        { e: "🍝", n: "Pasta Bowl", p: "₦5,200", t: "" },
                        { e: "🥤", n: "Chapman", p: "₦1,500", t: "" },
                      ].map((p, i) => (
                        <div key={`${dup}-${i}`} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-2.5">
                          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#2dd4bf]/20 to-[#3b82f6]/10 text-2xl">{p.e}</div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[11px] font-semibold text-white">{p.n}</div>
                            <div className="text-[10px] text-[#2dd4bf]">{p.p}</div>
                          </div>
                          {p.t && <span className="rounded-full bg-[#2dd4bf]/15 px-1.5 py-0.5 text-[8px] font-bold text-[#2dd4bf]">{p.t}</span>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="anim-float-card absolute -left-4 top-24 z-20 hidden w-52 rounded-2xl border border-white/10 bg-[#0a1628]/90 p-3 shadow-2xl backdrop-blur sm:block">
              <div className="flex items-center gap-3">
                <div className={`grid h-9 w-9 place-items-center rounded-xl ${TEAL_BG} text-lg`}>💰</div>
                <div>
                  <p className="text-[10px] text-white/50">New order</p>
                  <p className="text-sm font-bold text-white">₦4,500</p>
                </div>
              </div>
            </div>

            <div className="anim-float absolute -right-4 top-1/2 z-20 hidden w-48 rounded-2xl border border-white/10 bg-[#0a1628]/90 p-3 shadow-2xl backdrop-blur sm:block" style={{ animationDelay: "1s" }}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#2dd4bf]" />
                <div>
                  <p className="text-[10px] text-white/50">KYC verified</p>
                  <p className="text-xs font-bold text-white">Trust badge active</p>
                </div>
              </div>
            </div>

            <div className="anim-float-card absolute -right-2 bottom-16 z-20 hidden w-56 rounded-2xl border border-white/10 bg-[#0a1628]/90 p-3 shadow-2xl backdrop-blur sm:block" style={{ animationDelay: "2s" }}>
              <div className="flex items-center gap-2">
                <div className={`grid h-8 w-8 place-items-center rounded-lg bg-[#25D366] text-white`}>
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-white/50">WhatsApp receipt</p>
                  <p className="text-xs font-bold text-white">Sent to buyer ✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS STRIP ================= */}
      <section className={`${TEAL_BG} py-12`}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4">
          <Stat value={5000} suffix="+" label="Vendors" />
          <Stat value={2300000000} prefix="₦" label="Sales processed" />
          <Stat value={24} suffix="hr" label="Verification" />
          <Stat value={60} suffix="sec" label="Setup time" />
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className={`${NAVY_BG} py-24`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-3 py-1 text-xs font-semibold text-[#2dd4bf]">
              <Sparkles className="h-3 w-3" /> Built for African commerce
            </div>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
              Everything you need to <span className="text-[#2dd4bf]">sell smarter</span>.
            </h2>
            <p className="mt-4 text-white/60">
              From first tap to WhatsApp receipt — Nexa handles the boring parts so you can focus on your product.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", icon: Store, title: "Verified storefront", body: "A branded page with your catalog, prices and one-tap WhatsApp chat. Blue-check badge included once KYC is approved." },
              { n: "02", icon: Receipt, title: "Secure payments", body: "Buyers pay via Paystack or bank transfer. Auto-receipts, order tracking and refund flows are baked in." },
              { n: "03", icon: MessageCircle, title: "1-click follow-ups", body: "Every buyer's phone lands in your CRM. Send WhatsApp follow-ups with pre-filled messages from your dashboard." },
            ].map((f) => (
              <div
                key={f.n}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#2dd4bf]/30 hover:shadow-[0_20px_60px_-20px_#2dd4bf]"
              >
                <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#2dd4bf] to-transparent opacity-60`} />
                <div className="flex items-start justify-between">
                  <span className="font-display text-4xl font-black text-white/10">{f.n}</span>
                  <div className={`grid h-12 w-12 place-items-center rounded-xl bg-[#2dd4bf]/10 text-[#2dd4bf] transition-transform group-hover:scale-110`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE DEMO ================= */}
      <section className={`${NAVY_DEEP} py-24`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-3 py-1 text-xs font-semibold text-[#2dd4bf]">
              <ShoppingBag className="h-3 w-3" /> Try the buyer experience
            </div>
            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
              A checkout your buyers will <span className="text-[#2dd4bf]">actually finish</span>.
            </h2>
            <p className="mt-3 max-w-md text-white/60">Tap any product below. Watch it fly into the cart.</p>
          </div>
          <InteractiveDemo />
        </div>
      </section>

      {/* ================= VERIFIED BRANDS TICKER ================= */}
      <section className={`${NAVY_BG} py-20`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Trusted by <span className="text-[#2dd4bf]">verified vendors</span>
            </h2>
          </div>
        </div>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
          <div className="anim-ticker flex w-max gap-4">
            {[...Array(2)].flatMap((_, dup) =>
              [
                { n: "Ada's Kitchen", c: "Food", p: 42, e: "🍛" },
                { n: "Lumi Beauty", c: "Beauty", p: 128, e: "💄" },
                { n: "ThriftByK", c: "Thrift", p: 89, e: "👕" },
                { n: "Ankara Rise", c: "Fashion", p: 56, e: "👗" },
                { n: "GymFit NG", c: "Fitness", p: 34, e: "💪" },
                { n: "GlowSkin", c: "Beauty", p: 71, e: "✨" },
                { n: "BurgerBase", c: "Food", p: 25, e: "🍔" },
                { n: "SneakerLab", c: "Fashion", p: 63, e: "👟" },
              ].map((s, i) => (
                <div key={`${dup}-${i}`} className="flex w-72 shrink-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl bg-[#2dd4bf]/10 text-2xl`}>{s.e}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 truncate text-sm font-bold text-white">
                      {s.n} <ShieldCheck className="h-3 w-3 shrink-0 text-[#2dd4bf]" />
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="rounded-full bg-[#2dd4bf]/10 px-2 py-0.5 text-[10px] font-semibold text-[#2dd4bf]">{s.c}</span>
                      <span className="text-[10px] text-white/50">{s.p} products</span>
                    </div>
                  </div>
                </div>
              )),
            )}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" className={`${NAVY_DEEP} py-24`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-3 py-1 text-xs font-semibold text-[#2dd4bf]">
              Simple pricing
            </div>
            <h2 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl">
              Pick a plan that <span className="text-[#2dd4bf]">grows with you</span>.
            </h2>
          </div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 md:items-center">
            {/* Starter */}
            <div className="rounded-3xl border border-white/10 bg-white p-8 text-[#0a1628] shadow-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-[#0a1628]/60">Starter</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-black">₦0</span>
                <span className="text-sm text-[#0a1628]/60">/ month</span>
              </div>
              <p className="mt-2 text-sm text-[#0a1628]/60">For new sellers testing the waters.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {["Up to 10 products", "WhatsApp checkout", "Basic analytics", "Community support"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#14b8a6]" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="mt-8 block w-full rounded-xl border border-[#0a1628]/15 py-3 text-center text-sm font-semibold hover:bg-[#0a1628]/5">
                Start free
              </Link>
            </div>

            {/* Pro */}
            <div className="relative rounded-3xl border-2 border-[#2dd4bf] bg-gradient-to-br from-[#0a1628] to-[#060f1e] p-8 text-white shadow-[0_0_60px_-10px_#2dd4bf] md:scale-105">
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full ${TEAL_BG} px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0a1628]`}>
                Most popular
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">Pro</div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-black">₦7,500</span>
                <span className="text-sm text-white/60">/ month</span>
              </div>
              <p className="mt-2 text-sm text-white/60">For serious vendors ready to scale.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Unlimited products",
                  "KYC verified badge",
                  "1-click WhatsApp CRM",
                  "Advanced analytics + exports",
                  "Priority support",
                  "Custom domain",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-[#2dd4bf]" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`mt-8 block w-full rounded-xl ${TEAL_BG} ${TEAL_BG_HOVER} py-3 text-center text-sm font-bold text-[#0a1628]`}>
                Go Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WAITLIST ================= */}
      <section id="waitlist" className={`${NAVY_BG} py-24`}>
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-3 py-1 text-xs font-semibold text-[#2dd4bf]">
              <Star className="h-3 w-3" /> Early access
            </div>
            <h2 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl">
              Join the <span className="text-[#2dd4bf]">Nexa waitlist</span>.
            </h2>
            <p className="mt-4 text-white/70">
              Get white-glove onboarding, a founder-tier discount, and early access to features like AI product descriptions and Instagram sync.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/70">
              {[
                "Skip the queue for KYC verification",
                "Locked-in launch pricing forever",
                "1:1 onboarding with our team",
                "Vote on the roadmap",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-[#2dd4bf]" /> {f}</li>
              ))}
            </ul>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className={`${NAVY_DEEP} border-t border-white/10 py-16`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr_1fr]">
            <div>
              <div className="flex items-center gap-2">
                <div className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#2dd4bf] to-[#14b8a6] text-[#0a1628] font-black`}>N</div>
                <span className="font-display text-lg font-bold text-white">Nexa<span className="text-[#2dd4bf]">Vendors</span></span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-white/60">
                The verified storefront for Nigeria's WhatsApp economy. Sell like a real brand.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { h: "Product", links: ["Features", "Pricing", "Explore", "Verify"] },
                { h: "Company", links: ["About", "Careers", "Press", "Contact"] },
                { h: "Resources", links: ["Blog", "Help center", "API docs", "Status"] },
                { h: "Legal", links: ["Terms", "Privacy", "Cookies", "Refunds"] },
              ].map((col) => (
                <div key={col.h}>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">{col.h}</div>
                  <ul className="mt-4 space-y-2 text-sm text-white/60">
                    {col.links.map((l) => (
                      <li key={l}><a href="#" className="transition-colors hover:text-white">{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">Follow</div>
              <div className="mt-4 flex gap-3">
                {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-all hover:border-[#2dd4bf]/40 hover:text-[#2dd4bf]">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
            <span>© {new Date().getFullYear()} Nexa Vendors. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Built with <span className="text-[#2dd4bf]">♥</span> for Nigerian vendors
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
