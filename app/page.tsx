import { listEntries } from "@/lib/db";
import PageHeader from "@/components/PageHeader";
import DecideView from "@/components/DecideView";

export const dynamic = "force-dynamic";

export default async function DecidePage() {
  const entries = await listEntries();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="Tonight's Menu"
        title="What Are We Feeling?"
        subtitle="pick your mood, we'll pick the meal"
      />
      <DecideView initialEntries={entries} />
    </div>
  );
}
