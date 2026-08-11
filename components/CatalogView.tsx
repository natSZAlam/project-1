"use client";

import { useMemo, useState } from "react";
import { MapPin, Bike as BikeIcon, Pencil, Plus } from "lucide-react";
import { ALL_CATEGORIES, type Entry, type EntryInput } from "@/lib/types";
import { collectVibeTags } from "@/lib/vibes";
import ModeBadge from "@/components/ModeBadge";
import VibeTag from "@/components/VibeTag";
import Modal from "@/components/Modal";
import EntryForm from "@/components/EntryForm";

const TABS = ["All", ...ALL_CATEGORIES];

const MODE_ACCENT: Record<Entry["mode"], string> = {
  "Eat In": "var(--color-eatin)",
  "Eat Out": "var(--color-eatout)",
  "Order In": "var(--color-orderin)",
};

// Small deterministic "pinned at an angle" wobble so the grid reads like a
// scrapbooked corkboard instead of a rigid list.
const ROTATIONS = [-1.5, 1, -0.75, 1.5, -1.25, 0.75];

export default function CatalogView({
  initialEntries,
}: {
  initialEntries: Entry[];
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [modal, setModal] = useState<"create" | Entry | null>(null);

  const availableVibes = useMemo(() => collectVibeTags(entries), [entries]);

  const filtered = useMemo(
    () =>
      activeTab === "All"
        ? entries
        : entries.filter((e) => e.category === activeTab),
    [entries, activeTab],
  );

  async function handleCreate(input: EntryInput) {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Could not save entry.");
    }
    const created: Entry = await res.json();
    setEntries((prev) =>
      [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setModal(null);
  }

  async function handleUpdate(id: string, input: EntryInput) {
    const res = await fetch(`/api/entries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? "Could not save entry.");
    }
    const updated: Entry = await res.json();
    setEntries((prev) =>
      prev
        .map((e) => (e.id === id ? updated : e))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setModal(null);
  }

  async function handleDelete(entry: Entry) {
    if (!window.confirm(`Delete "${entry.name}" from the catalog?`)) return;
    const res = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setModal(null);
    }
  }

  return (
    <div className="px-4 pt-6 pb-10 space-y-5">
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="block-chip block-chip-interactive shrink-0 px-3 py-1.5 text-xs font-extrabold"
            style={{
              backgroundColor: activeTab === tab ? "var(--color-primary)" : "var(--color-card)",
              color: activeTab === tab ? "#FFFFFF" : "var(--color-foreground)",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setModal("create")}
        className="block-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-extrabold text-accent-foreground"
      >
        <Plus size={18} aria-hidden="true" />
        Add to the Catalog
      </button>

      {filtered.length === 0 ? (
        <p className="block-panel border-dashed p-6 text-center font-display text-2xl font-bold text-muted-foreground">
          Nothing here yet.
        </p>
      ) : (
        <ul className="columns-2 gap-3 [column-fill:_balance] sm:columns-2">
          {filtered.map((entry, index) => (
            <li key={entry.id} className="mb-3 break-inside-avoid">
              <button
                type="button"
                onClick={() => setModal(entry)}
                style={{
                  transform: `rotate(${ROTATIONS[index % ROTATIONS.length]}deg)`,
                  borderTopColor: MODE_ACCENT[entry.mode],
                  borderTopWidth: "6px",
                }}
                className="block-btn group w-full rounded-2xl bg-card p-3 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-display text-base font-bold leading-tight text-foreground">
                    {entry.name}
                  </p>
                  <Pencil
                    size={14}
                    className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <ModeBadge mode={entry.mode} className="px-2 py-0.5 text-[10px]" />
                  <span className="block-chip bg-muted px-2 py-0.5 text-[10px] font-extrabold text-foreground">
                    {entry.category}
                  </span>
                </div>

                {(entry.location || entry.deliveryApp) && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    {entry.mode === "Eat Out" ? (
                      <MapPin size={12} aria-hidden="true" />
                    ) : (
                      <BikeIcon size={12} aria-hidden="true" />
                    )}
                    {entry.location || entry.deliveryApp}
                  </p>
                )}

                {entry.goTo && (
                  <p className="mt-2 text-sm font-bold leading-snug text-foreground/80">
                    {entry.goTo}
                  </p>
                )}

                {entry.vibes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.vibes.map((vibe) => (
                      <VibeTag key={vibe} label={vibe} />
                    ))}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <Modal
          title={modal === "create" ? "Add to the Catalog" : "Edit Entry"}
          onClose={() => setModal(null)}
        >
          <EntryForm
            initial={modal === "create" ? undefined : modal}
            availableVibes={availableVibes}
            onSubmit={(input) =>
              modal === "create"
                ? handleCreate(input)
                : handleUpdate(modal.id, input)
            }
            onCancel={() => setModal(null)}
            onDelete={
              modal === "create" ? undefined : () => handleDelete(modal)
            }
          />
        </Modal>
      )}
    </div>
  );
}
