import { OverviewVisuals } from "@/components/dashboard/OverviewVisuals";
import type { StaffRole } from "@/services/authService";
import type { Cohort } from "@/services/cohortService";

type Candidate = {
  cohort_id: string;
  status: string;
  training_status: string;
  needs_uza_access_support?: boolean;
  deposit_available_rwf?: number | null;
  has_bank_account?: boolean;
  listed_on_crb?: boolean;
  loan_review_status?: string;
  [key: string]: unknown;
};

const OVERVIEW_TITLES: Record<StaffRole, string> = {
  admin: "Programme overview",
  instructor: "Training overview",
  bank_partner: "Loan pipeline overview",
};

export function OverviewPanel({
  cohorts,
  candidates,
  role,
}: {
  cohorts: Cohort[];
  candidates: Candidate[];
  role: StaffRole;
}) {
  return (
    <div className="pb-4">
      <header>
        <p className="text-eyebrow text-muted-foreground">Overview</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {OVERVIEW_TITLES[role]}
        </h1>
      </header>

      <OverviewVisuals
        className="mt-5"
        cohorts={cohorts}
        candidates={candidates}
        role={role}
      />
    </div>
  );
}
