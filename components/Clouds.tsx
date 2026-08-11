const CLOUDS = [
  { top: "6%", width: 92, height: 30, duration: 55, delay: -5 },
  { top: "16%", width: 56, height: 20, duration: 75, delay: -40 },
  { top: "3%", width: 46, height: 16, duration: 42, delay: -20 },
  { top: "24%", width: 70, height: 24, duration: 65, delay: -55 },
];

/** Purely decorative Mario-sky ambiance. Respects prefers-reduced-motion via
 * the global animation-duration override in globals.css. */
export default function Clouds() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {CLOUDS.map((c, i) => (
        <span
          key={i}
          className="cloud animate-cloud-drift"
          style={{
            top: c.top,
            width: c.width,
            height: c.height,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
