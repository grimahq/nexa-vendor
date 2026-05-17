import { useRef, useState, useEffect, type ReactNode } from "react";

type MagnetProps = {
  children: ReactNode;
  padding?: number;
  strength?: number;
  className?: string;
};

/**
 * Magnetic hover: tracks the cursor relative to the element center and
 * applies a translate3d transform when the cursor is within `padding` px
 * of the element's edges.
 */
export function Magnet({ children, padding = 80, strength = 4, className }: MagnetProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState("translate3d(0,0,0)");
  const [transition, setTransition] = useState("transform 0.6s ease-in-out");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    function onMove(e: MouseEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const within =
        Math.abs(dx) < rect.width / 2 + padding && Math.abs(dy) < rect.height / 2 + padding;
      if (within) {
        setTransition("transform 0.3s ease-out");
        setTransform(`translate3d(${dx / strength}px, ${dy / strength}px, 0)`);
      } else {
        setTransition("transform 0.6s ease-in-out");
        setTransform("translate3d(0,0,0)");
      }
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [padding, strength]);

  return (
    <div ref={ref} className={className} style={{ transform, transition, willChange: "transform" }}>
      {children}
    </div>
  );
}
