import { listEntries } from "@/lib/db";
import { readPlan } from "@/lib/planStore";
import PageHeader from "@/components/PageHeader";
import PlanView from "@/components/PlanView";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const [entries, plan] = await Promise.all([listEntries(), readPlan()]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow="World Map"
        title="This Week"
        subtitle="line up the week's meals in advance"
      />
      <PlanView initialPlan={plan} entries={entries} />
    </div>
  );
}
