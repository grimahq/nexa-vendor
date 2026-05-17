import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, ShieldCheck, Receipt, type LucideIcon } from "lucide-react";
import { Magnet } from "./Magnet";

type Project = {
  tag: string;
  title: string;
  body: string;
  icon: LucideIcon;
  accent: string;
};

const PROJECTS: Project[] = [
  {
    tag: "01 — Storefront",
    title: "One link. A real brand.",
    body: "A 60-second storefront with your logo, catalog and shareable WhatsApp link. Buyers tap, browse and order without leaving chat.",
    icon: Sparkles,
    accent: "from-fuchsia-500/40 to-violet-500/10",
  },
  {
    tag: "02 — Verified",
    title: "The blue check that sells.",
    body: "Submit your NIN and business doc once. We verify within 24 hours and unlock the Nexa badge — buyers convert 3× faster.",
    icon: ShieldCheck,
    accent: "from-cyan-400/40 to-sky-500/10",
  },
  {
    tag: "03 — Moniepoint",
    title: "Payment trust, solved.",
    body: "Native Moniepoint checkout: every product card shows a Pay now button tied to your sub-account. Receipts auto-route back to WhatsApp.",
    icon: Receipt,
    accent: "from-amber-400/40 to-orange-500/10",
  },
];

export function StackingProjects() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={wrapRef} className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mb-16 flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground/80 backdrop-blur">
          The Project
        </span>
        <h2 className="hero-heading mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-gradient">Project</span>
        </h2>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Three pillars that turn a WhatsApp side hustle into a brand customers trust.
        </p>
      </div>

      <div className="relative">
        {PROJECTS.map((p, i) => {
          const targetScale = 1 - (PROJECTS.length - 1 - i) * 0.03;
          const scale = useTransform(
            scrollYProgress,
            [i / PROJECTS.length, 1],
            [1, targetScale],
          );
          return (
            <div
              key={p.title}
              className="sticky top-24 md:top-32 h-[85vh]"
              style={{ top: `${24 + i * 28}px` }}
            >
              <motion.div
                style={{ scale }}
                className="mx-auto h-full max-w-5xl rounded-[40px] sm:rounded-[50px] md:rounded-[60px] border-2 border-[#D7E2EA]/20 bg-[#0C0C0C] p-4 sm:p-6 md:p-8 shadow-elevated"
              >
                <div className={`relative grid h-full overflow-hidden rounded-[28px] sm:rounded-[40px] bg-gradient-to-br ${p.accent} p-6 sm:p-10 md:grid-cols-2 md:gap-8`}>
                  <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
                  <div className="relative flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{p.tag}</p>
                      <h3 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                        {p.title}
                      </h3>
                      <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
                        {p.body}
                      </p>
                    </div>
                    <Magnet padding={120} strength={5} className="mt-8 inline-block">
                      <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-primary-glow" />
                        Pillar {i + 1} of {PROJECTS.length}
                      </div>
                    </Magnet>
                  </div>

                  <div className="relative hidden items-center justify-center md:flex">
                    <Magnet padding={140} strength={6}>
                      <div className="grid h-44 w-44 place-items-center rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl sm:h-56 sm:w-56">
                        <p.icon className="h-20 w-20 text-primary-glow drop-shadow-[0_0_25px_rgba(167,139,250,0.6)] sm:h-24 sm:w-24" />
                      </div>
                    </Magnet>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
