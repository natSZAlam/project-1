import { Star } from "lucide-react";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="border-b-4 border-foreground bg-primary px-5 pt-8 pb-6 text-center text-primary-foreground">
      <p className="stamp inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-secondary">
        <Star
          size={14}
          className="animate-coin-spin fill-secondary"
          aria-hidden="true"
        />
        {eyebrow}
      </p>
      <h1
        className="mt-1 font-display text-4xl font-bold"
        style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.35)" }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 font-body text-base font-extrabold leading-tight text-primary-foreground/90">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
