"use client";

import { useState } from "react";
import { Plus, ShoppingBasket, X } from "lucide-react";
import Modal from "@/components/Modal";

export default function PantryButton({
  items,
  onChange,
}: {
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(items);
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);

  function openModal() {
    setDraft(items);
    setOpen(true);
  }

  function addItem() {
    const value = newItem.trim();
    if (!value) return;
    if (!draft.some((d) => d.toLowerCase() === value.toLowerCase())) {
      setDraft((prev) => [...prev, value]);
    }
    setNewItem("");
  }

  function removeItem(item: string) {
    setDraft((prev) => prev.filter((d) => d !== item));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/pantry", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: draft }),
      });
      const data: { items: string[] } = await res.json();
      onChange(data.items);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="block-chip block-chip-interactive inline-flex items-center gap-1.5 bg-card px-3 py-1.5 text-xs font-extrabold text-foreground"
      >
        <ShoppingBasket size={14} aria-hidden="true" />
        Pantry ({items.length})
      </button>

      {open && (
        <Modal title="Your Pantry" onClose={() => setOpen(false)}>
          <div className="space-y-4">
            <p className="text-sm font-bold text-muted-foreground">
              What&apos;s in the kitchen right now? The Decide filter uses
              this to find recipes you can fully make without a shopping
              trip.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {draft.length === 0 && (
                <p className="text-sm font-bold text-muted-foreground">
                  Nothing added yet.
                </p>
              )}
              {draft.map((item) => (
                <span
                  key={item}
                  className="block-chip inline-flex items-center gap-1 bg-muted px-2.5 py-1 text-xs font-extrabold text-foreground"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    aria-label={`Remove ${item}`}
                    className="cursor-pointer"
                  >
                    <X size={12} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem();
                  }
                }}
                placeholder="e.g. eggs"
                className="flex-1 rounded-2xl border-[3px] border-foreground bg-card px-3 py-1.5 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
              />
              <button
                type="button"
                onClick={addItem}
                className="block-btn rounded-2xl bg-secondary px-3 py-1.5 text-secondary-foreground"
                aria-label="Add item"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="block-btn flex-1 rounded-2xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground disabled:cursor-wait"
              >
                {saving ? "Saving..." : "Save Pantry"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="block-btn rounded-2xl bg-card px-4 py-2.5 text-sm font-extrabold text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
