import { listEntries } from "@/lib/db";
import { readSettings } from "@/lib/settingsStore";
import { readPantry } from "@/lib/pantryStore";
import PageHeader from "@/components/PageHeader";
import DecideView from "@/components/DecideView";

export const dynamic = "force-dynamic";

export default async function DecidePage() {
  const [entries, settings, pantry] = await Promise.all([
    listEntries(),
    readSettings(),
    readPantry(),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Tonight's Menu"
        title="What Are We Feeling?"
        subtitle="pick your mood, we'll pick the meal"
      />
      <DecideView initialEntries={entries} settings={settings} pantry={pantry} />
    </div>
  );
}
