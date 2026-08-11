import { Star } from "lucide-react";

const PARTICLES = 10;

export default function StarBurst() {
  const items = Array.from({ length: PARTICLES }, (_, i) => {
    const angle = (i / PARTICLES) * Math.PI * 2;
    const distance = 60 + (i % 3) * 22;
    return {
      tx: Math.cos(angle) * distance,
      ty: Math.sin(angle) * distance,
      delay: (i % 4) * 35,
      size: 14 + (i % 3) * 4,
    };
  });

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      {items.map((p, i) => (
        <Star
          key={i}
          size={p.size}
          className="star-particle fill-secondary text-foreground"
          style={
            {
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
