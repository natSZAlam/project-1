"use client";

import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import Modal from "@/components/Modal";
import type { EntryPrefill } from "@/lib/types";

interface ImportResponse {
  name: string | null;
  address: string | null;
  category: string | null;
  error?: string;
}

export default function GoogleMapsImportButton({
  onImported,
}: {
  onImported: (prefill: EntryPrefill) => void;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFetch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/import/google-maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data: ImportResponse = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't read that link.");

      onImported({
        name: data.name ?? undefined,
        mode: "Eat Out",
        category: data.category ?? undefined,
        locations: data.address ? [data.address] : undefined,
      });
      setUrl("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3 text-sm font-extrabold text-secondary-foreground"
      >
        <Link2 size={18} aria-hidden="true" />
        Quick Add from Google Maps
      </button>

      {open && (
        <Modal title="Quick Add from Google Maps" onClose={() => setOpen(false)}>
          <form onSubmit={handleFetch} className="space-y-4">
            <p className="text-sm font-bold text-muted-foreground">
              Paste a Google Maps share link — we&apos;ll pull the name &amp;
              address and hand you a pre-filled entry to check over before
              saving.
            </p>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25"
            />
            {error && (
              <p className="block-chip bg-destructive px-3 py-2 text-sm font-extrabold text-destructive-foreground">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="block-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground disabled:cursor-wait"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Link2 size={16} aria-hidden="true" />
              )}
              {loading ? "Fetching..." : "Fetch details"}
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
