export function MeshBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="blob -left-32 -top-32 h-[420px] w-[420px] bg-primary/40" />
      <div className="blob -right-32 top-1/3 h-[460px] w-[460px] bg-primary-glow/40" />
      <div className="blob -bottom-32 left-1/3 h-[400px] w-[400px] bg-chart-5/30" />
      <div className="absolute inset-0 bg-gradient-radial opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,oklch(1_0_0/0.04)_1px,transparent_0)] [background-size:24px_24px]" />
    </div>
  );
}
