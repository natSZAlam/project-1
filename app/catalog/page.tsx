import { listEntries } from "@/lib/db";
import { readSettings } from "@/lib/settingsStore";
import PageHeader from "@/components/PageHeader";
import CatalogView from "@/components/CatalogView";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const [entries, settings] = await Promise.all([listEntries(), readSettings()]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Power-Up Stash"
        title="Catalog"
        subtitle="collect every place & plate we love"
      />
      <CatalogView initialEntries={entries} settings={settings} />
    </div>
  );
}
