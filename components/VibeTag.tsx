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
  const classes = `block-chip inline-flex items-center px-3 py-1 text-xs font-extrabold ${
    selected
      ? "bg-primary text-primary-foreground"
      : "bg-card text-foreground"
  } ${onClick ? "block-chip-interactive" : ""}`;

  if (As === "button") {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {label}
      </button>
    );
  }
  return <span className={classes}>{label}</span>;
}
