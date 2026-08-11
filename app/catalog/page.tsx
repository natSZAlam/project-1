import { listEntries } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import CatalogView from "@/components/CatalogView";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const entries = await listEntries();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="The Archive"
        title="Catalog"
        subtitle="every place & plate we love"
      />
      <CatalogView initialEntries={entries} />
    </div>
  );
}
