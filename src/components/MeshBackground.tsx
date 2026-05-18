export function MeshBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Subtle, mostly-neutral gradient — no purple flood */}
      <div className="blob -left-40 -top-40 h-[420px] w-[420px] bg-primary/10" />
      <div className="blob -right-40 top-1/2 h-[420px] w-[420px] bg-chart-5/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,oklch(1_0_0/0.04)_1px,transparent_0)] [background-size:28px_28px] opacity-60" />
    </div>
  );
}
