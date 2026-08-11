"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import Modal from "@/components/Modal";
import type { Settings } from "@/lib/types";

type FieldStatus = "unknown" | "found" | "not-found";

export default function SettingsButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [home, setHome] = useState("");
  const [university, setUniversity] = useState("");
  const [homeStatus, setHomeStatus] = useState<FieldStatus>("unknown");
  const [uniStatus, setUniStatus] = useState<FieldStatus>("unknown");

  useEffect(() => {
    if (!open) return;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((settings: Settings) => {
        setHome(settings.home?.address ?? "");
        setUniversity(settings.university?.address ?? "");
        setHomeStatus(settings.home ? (settings.home.geo ? "found" : "not-found") : "unknown");
        setUniStatus(
          settings.university ? (settings.university.geo ? "found" : "not-found") : "unknown",
        );
      });
  }, [open]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ home, university }),
      });
      const settings: Settings = await res.json();
      setHomeStatus(settings.home ? (settings.home.geo ? "found" : "not-found") : "unknown");
      setUniStatus(
        settings.university ? (settings.university.geo ? "found" : "not-found") : "unknown",
      );
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Settings"
        className="block-btn absolute right-4 top-4 rounded-full bg-card p-2 text-foreground"
      >
        <SettingsIcon size={18} aria-hidden="true" />
      </button>

      {open && (
        <Modal title="Home Base" onClose={() => setOpen(false)}>
          <form onSubmit={handleSave} className="space-y-5">
            <p className="text-sm font-bold text-muted-foreground">
              Set your home &amp; university so Eat Out spots can show how far
              away they are (straight-line distance).
            </p>

            <FieldWithStatus
              id="settings-home"
              label="Home address"
              value={home}
              onChange={setHome}
              status={homeStatus}
              disabled={saving}
            />

            <FieldWithStatus
              id="settings-university"
              label="University address"
              value={university}
              onChange={setUniversity}
              status={uniStatus}
              disabled={saving}
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="block-btn flex-1 rounded-2xl bg-primary px-4 py-2.5 text-sm font-extrabold text-primary-foreground disabled:cursor-wait"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="block-btn rounded-2xl bg-card px-4 py-2.5 text-sm font-extrabold text-foreground"
              >
                Close
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function FieldWithStatus({
  id,
  label,
  value,
  onChange,
  status,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  status: FieldStatus;
  disabled: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-extrabold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 25 Main St, Warsaw"
        className="mt-1.5 w-full rounded-2xl border-[3px] border-foreground bg-card px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-4 focus:ring-primary/25 disabled:opacity-60"
      />
      {status === "found" && (
        <p
          className="mt-1 flex items-center gap-1 text-xs font-bold"
          style={{ color: "var(--color-eatin)" }}
        >
          <CheckCircle2 size={13} aria-hidden="true" /> Found it
        </p>
      )}
      {status === "not-found" && (
        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-destructive">
          <AlertTriangle size={13} aria-hidden="true" /> Couldn&apos;t find that address —
          try being more specific
        </p>
      )}
    </div>
  );
}
