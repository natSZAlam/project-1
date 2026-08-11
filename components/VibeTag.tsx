export default function VibeTag({
  label,
  selected = false,
  onClick,
  as: As = "span",
}: {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  as?: "span" | "button";
}) {
  const classes = `inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
    selected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-muted text-muted-foreground"
  } ${onClick ? "cursor-pointer hover:border-primary" : ""}`;

  if (As === "button") {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {label}
      </button>
    );
  }
  return <span className={classes}>{label}</span>;
}
