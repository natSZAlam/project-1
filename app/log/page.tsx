import { listEntries } from "@/lib/db";
import { listLog } from "@/lib/logStore";
import { readSettings } from "@/lib/settingsStore";
import PageHeader from "@/components/PageHeader";
import LogView from "@/components/LogView";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  const [entries, log, settings] = await Promise.all([
    listEntries(),
    listLog(),
    readSettings(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Scoreboard"
        title="History"
        subtitle="streaks, spend, and what you actually ate"
      />
      <LogView initialLog={log} entries={entries} settings={settings} />
    </div>
  );
}
