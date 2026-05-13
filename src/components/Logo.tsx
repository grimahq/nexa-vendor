import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group flex items-center gap-2 ${className}`}>
      <div className="relative h-8 w-8">
        <div className="absolute inset-0 rounded-lg bg-gradient-primary shadow-glow transition-transform group-hover:scale-110" />
        <div className="absolute inset-[3px] rounded-md bg-background/80 backdrop-blur" />
        <span className="absolute inset-0 grid place-items-center font-display text-sm font-bold text-foreground">
          N
        </span>
      </div>
      <span className="font-display text-lg font-bold tracking-tight">
        Nexa<span className="text-gradient">Vendors</span>
      </span>
    </Link>
  );
}
