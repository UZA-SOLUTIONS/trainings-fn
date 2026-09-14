import { Link } from "react-router-dom";
import type { Cohort } from "@/services/cohortService";
import { CohortTabs } from "./CohortTabs";

export function CohortClassroomHeader({
  cohort,
  loading,
}: {
  cohort?: Cohort;
  loading?: boolean;
}) {
  return (
    <div>
      <Link
        to="/dashboard?tab=candidates"
        className="inline-flex text-base text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Candidates
      </Link>
      {loading && !cohort && <p className="mt-6 text-base text-muted-foreground">Loading cohort…</p>}
      {cohort && (
        <div className="mt-6">
          <p className="text-eyebrow text-muted-foreground">{cohort.code}</p>
          <h1 className="mt-2 font-display text-4xl font-bold">{cohort.name}</h1>
          <CohortTabs cohortId={cohort.id} />
        </div>
      )}
    </div>
  );
}
