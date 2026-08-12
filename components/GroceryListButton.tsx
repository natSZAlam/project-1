"use client";

import { useEffect, useState } from "react";
import { Check, Clipboard, ClipboardCheck, ShoppingCart } from "lucide-react";
import Modal from "@/components/Modal";
import type { Entry } from "@/lib/types";

export default function GroceryListButton({
  entry,
  variant = "full",
}: {
  entry: Entry;
  /** "full" = labeled button (reveal ticket); "icon" = compact icon-only (catalog card) */
  variant?: "full" | "icon";
}) {
  const [open, setOpen] = useState(false);
  const [pantryItems, setPantryItems] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/pantry")
      .then((res) => res.json())
      .then((data: { items: string[] }) => setPantryItems(data.items));
  }, [open]);

  const ingredients = entry.ingredients ?? [];
  if (ingredients.length === 0) return null;

  const pantryLower = new Set((pantryItems ?? []).map((i) => i.toLowerCase()));
  const needed = ingredients.filter((i) => !pantryLower.has(i.toLowerCase()));
  const have = ingredients.filter((i) => pantryLower.has(i.toLowerCase()));

  async function handleCopy() {
    await navigator.clipboard.writeText(needed.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Grocery list"
        className={
          variant === "icon"
            ? "block-btn rounded-full bg-card p-1.5 text-foreground"
            : "block-btn inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-extrabold text-secondary-foreground"
        }
      >
        <ShoppingCart size={variant === "icon" ? 14 : 15} aria-hidden="true" />
        {variant === "full" && "Grocery List"}
      </button>

      {open && (
        <Modal title={`Shopping List — ${entry.name}`} onClose={() => setOpen(false)}>
          <div className="space-y-4">
            {pantryItems === null ? (
              <p className="text-sm font-bold text-muted-foreground">Checking your pantry...</p>
            ) : (
              <>
                {needed.length > 0 ? (
                  <div>
                    <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                      Need to buy
                    </p>
                    <ul className="space-y-1.5">
                      {needed.map((item) => (
                        <li
                          key={item}
                          className="block-chip flex items-center gap-2 bg-card px-3 py-1.5 text-sm font-bold text-foreground"
                        >
                          <ShoppingCart size={13} className="shrink-0 text-primary" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="block-chip bg-muted px-3 py-2 text-sm font-bold text-foreground">
                    You&apos;ve already got everything for this one!
                  </p>
                )}

                {have.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                      Already have
                    </p>
                    <ul className="space-y-1.5">
                      {have.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 px-3 py-1 text-sm font-bold text-muted-foreground line-through decoration-2"
                        >
                          <Check size={13} className="shrink-0" aria-hidden="true" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {needed.length > 0 && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="block-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground"
                  >
                    {copied ? (
                      <>
                        <ClipboardCheck size={16} aria-hidden="true" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard size={16} aria-hidden="true" />
                        Copy List
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
