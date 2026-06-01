export function MeshBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Soft blue accents on a near-white canvas */}
      <div className="blob -left-32 -top-40 h-[480px] w-[480px] bg-primary/15" />
      <div className="blob right-[-15%] top-1/3 h-[420px] w-[420px] bg-chart-5/15" />
      <div className="blob left-1/3 bottom-[-10%] h-[360px] w-[360px] bg-primary-glow/10" />
      {/* fine dot grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,oklch(0.22_0.04_250/0.06)_1px,transparent_0)] [background-size:28px_28px] opacity-70" />
      {/* top-to-bottom fade */}
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-background to-transparent" />
    </div>
  );
}
