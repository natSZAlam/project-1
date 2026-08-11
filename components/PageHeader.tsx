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
    <header className="border-b-2 border-dashed border-border bg-card/60 px-5 pt-8 pb-6 text-center">
      <p className="stamp text-xs font-bold text-secondary">{eyebrow}</p>
      <h1 className="mt-1 font-display text-4xl text-primary">{title}</h1>
      {subtitle ? (
        <p className="mt-2 font-hand text-xl text-muted-foreground leading-tight">
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
