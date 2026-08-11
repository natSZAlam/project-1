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
    <div className="px-5 pt-6 pb-10 space-y-5">
      <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === tab
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-muted text-muted-foreground hover:border-primary/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setModal("create")}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 py-3 text-sm font-semibold text-primary hover:bg-primary/5"
      >
        <Plus size={18} aria-hidden="true" />
        Add to the Catalog
      </button>

      {filtered.length === 0 ? (
        <p className="card-stock rounded-xl border-dashed p-6 text-center font-hand text-2xl text-muted-foreground">
          Nothing here yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => setModal(entry)}
                className="card-stock group w-full cursor-pointer rounded-xl p-4 text-left transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg text-foreground">
                      {entry.name}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <ModeBadge mode={entry.mode} />
                      <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        {entry.category}
                      </span>
                    </div>
                  </div>
                  <Pencil
                    size={16}
                    className="mt-1 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>

                {(entry.location || entry.deliveryApp) && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    {entry.mode === "Eat Out" ? (
                      <MapPin size={14} aria-hidden="true" />
                    ) : (
                      <BikeIcon size={14} aria-hidden="true" />
                    )}
                    {entry.location || entry.deliveryApp}
                  </p>
                )}

                {entry.goTo && (
                  <p className="mt-2 truncate font-hand text-lg leading-none text-secondary">
                    {entry.goTo}
                  </p>
                )}

                {entry.vibes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
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
