import type { Cohort } from "@/services/cohortService";
import type { StaffRole } from "@/services/authService";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DonutChart,
  GroupedHistogram,
  HistogramChart,
  HorizontalBar,
  StatRing,
} from "@/components/charts/ChartPrimitives";
import { cn } from "@/lib/utils";

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

const DOC_KEYS = [
  "doc_national_id",
  "doc_driving_license",
  "doc_passport_photo",
  "doc_criminal_record",
  "doc_proof_of_residence",
  "doc_bank_statement",
  "doc_medical_certificate",
] as const;

const MIN_DEPOSIT = 500_000;

const BAR_COLORS = [
  "var(--primary)",
  "var(--volt)",
  "oklch(0.55 0.08 158)",
  "oklch(0.62 0.12 250)",
  "oklch(0.58 0.14 40)",
  "oklch(0.5 0.1 300)",
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-RW").format(Math.round(n));
}

function docsComplete(c: Candidate) {
  return DOC_KEYS.every((k) => c[k] === true);
}

function shortCohortLabel(c: Cohort) {
  return c.code || c.name.slice(0, 12);
}

export function OverviewVisuals({
  cohorts,
  candidates,
  role = "admin",
  className,
}: {
  cohorts: Cohort[];
  candidates: Candidate[];
  role?: StaffRole;
  className?: string;
}) {
  const count = (s: string) => candidates.filter((c) => c.status === s).length;
  const capacity = cohorts.reduce((a, c) => a + c.capacity, 0);
  const enrolled = count("enrolled");
  const graduated = count("graduated");
  const seated = enrolled + graduated;
  const waitlisted = count("waitlisted");
  const other = candidates.length - enrolled - graduated - waitlisted;
  const emptySeats = Math.max(0, capacity - seated);

  const docsDone = candidates.filter(docsComplete).length;
  const docsPending = candidates.length - docsDone;

  const trainingCompleted = candidates.filter((c) => c.training_status === "completed").length;
  const trainingInProgress = candidates.filter((c) => c.training_status === "in_progress").length;
  const trainingNotStarted = candidates.filter((c) => c.training_status === "not_started").length;
  const trainingFailed = candidates.filter((c) => c.training_status === "failed").length;

  const accessSupport = candidates.filter((c) => c.needs_uza_access_support).length;
  const banked = candidates.filter((c) => c.has_bank_account).length;
  const accessOnly = candidates.filter(
    (c) => c.needs_uza_access_support && !c.has_bank_account,
  ).length;
  const bankOnly = candidates.filter(
    (c) => c.has_bank_account && !c.needs_uza_access_support,
  ).length;
  const neither = candidates.filter(
    (c) => !c.has_bank_account && !c.needs_uza_access_support,
  ).length;
  const bothAccess = candidates.filter(
    (c) => c.has_bank_account && c.needs_uza_access_support,
  ).length;

  const deposits = candidates
    .map((c) => Number(c.deposit_available_rwf ?? 0))
    .filter((n) => n > 0);
  const avgDeposit = deposits.length
    ? deposits.reduce((a, b) => a + b, 0) / deposits.length
    : 0;
  const meetsMinDeposit = candidates.filter(
    (c) => Number(c.deposit_available_rwf ?? 0) >= MIN_DEPOSIT,
  ).length;

  const seatPct = capacity > 0 ? Math.round((seated / capacity) * 100) : 0;
  const docsPct =
    candidates.length > 0 ? Math.round((docsDone / candidates.length) * 100) : 0;
  const trainingPct =
    candidates.length > 0 ? Math.round((trainingCompleted / candidates.length) * 100) : 0;

  const crbListed = candidates.filter((c) => c.listed_on_crb).length;
  const loanApproved = candidates.filter((c) => c.loan_review_status === "approved").length;
  const loanInReview = candidates.filter(
    (c) => c.loan_review_status === "in_review" || c.loan_review_status === "pending",
  ).length;
  const loanDeclined = candidates.filter((c) => c.loan_review_status === "declined").length;
  const readyForReview = candidates.filter(
    (c) => c.training_status === "completed" && docsComplete(c),
  ).length;

  const openCohorts = cohorts.filter((c) => c.applications_open).length;
  const closedCohorts = cohorts.length - openCohorts;

  const applicationsByStatus = [
    { label: "Enrolled", value: enrolled, color: "var(--primary)" },
    { label: "Waiting", value: waitlisted, color: "var(--volt)" },
    { label: "Graduated", value: graduated, color: "oklch(0.55 0.08 158)" },
    { label: "Other", value: Math.max(0, other), color: "oklch(0.78 0.02 130)" },
  ];

  const applicationsReceivedBars = cohorts.map((c, i) => {
    const inCohort = candidates.filter((x) => x.cohort_id === c.id);
    return {
      label: shortCohortLabel(c),
      subLabel: c.applications_open ? "Open" : "Closed",
      value: inCohort.length,
      color: BAR_COLORS[i % BAR_COLORS.length],
    };
  });

  const capacityGroups = cohorts.map((c) => {
    const inCohort = candidates.filter((x) => x.cohort_id === c.id);
    const filled = inCohort.filter(
      (x) => x.status === "enrolled" || x.status === "graduated",
    ).length;
    const waiting = inCohort.filter((x) => x.status === "waitlisted").length;
    return {
      label: shortCohortLabel(c),
      values: {
        filled,
        capacity: c.capacity,
        waiting,
      },
    };
  });

  const trainingSessionBars = [
    { label: "Not started", value: trainingNotStarted, color: "oklch(0.78 0.02 130)" },
    { label: "In session", value: trainingInProgress, color: "var(--volt)" },
    { label: "Completed", value: trainingCompleted, color: "var(--primary)" },
    { label: "Failed", value: trainingFailed, color: "var(--destructive)" },
  ];

  const locationMap = new Map<string, number>();
  for (const c of cohorts) {
    const loc = c.location?.trim() || "Unspecified";
    locationMap.set(loc, (locationMap.get(loc) ?? 0) + 1);
  }
  const locationBars = [...locationMap.entries()].map(([label, value], i) => ({
    label,
    value,
    color: BAR_COLORS[i % BAR_COLORS.length],
  }));

  const showFinancing = role === "admin";
  const showTrainingFocus = role === "admin" || role === "instructor";
  const showLoanPipeline = role === "admin" || role === "bank_partner";
  const showCohortCharts = role === "admin" || role === "instructor" || role === "bank_partner";
  const statGridCols =
    role === "instructor" ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={cn("flex flex-col gap-6 pb-10", className)}>
      {/* KPI rings */}
      <div className={cn("grid gap-4", statGridCols)}>
        {(role === "admin" || role === "instructor") && (
          <StatRing
            title="Application pipeline"
            centerLabel={String(candidates.length)}
            centerSub="total"
            segments={[
              { value: enrolled, color: "var(--primary)", label: "Enrolled" },
              { value: waitlisted, color: "var(--volt)", label: "Waiting" },
              { value: graduated, color: "oklch(0.55 0.08 158)", label: "Graduated" },
              { value: other, color: "oklch(0.85 0.01 130)", label: "Other" },
            ]}
            legend={[
              { value: enrolled, color: "var(--primary)", label: "Enrolled" },
              { value: waitlisted, color: "var(--volt)", label: "Waiting list" },
              { value: graduated, color: "oklch(0.55 0.08 158)", label: "Graduated" },
              { value: other, color: "oklch(0.85 0.01 130)", label: "Rejected / withdrawn" },
            ]}
          />
        )}
        {showTrainingFocus && (
          <StatRing
            title="Seat utilisation"
            centerLabel={`${seatPct}%`}
            centerSub="filled"
            segments={[
              { value: seated, color: "var(--primary)", label: "Filled" },
              { value: emptySeats, color: "oklch(0.85 0.01 130)", label: "Empty" },
            ]}
            legend={[
              { value: `${seated} / ${capacity}`, color: "var(--primary)", label: "Seats taken" },
              { value: emptySeats, color: "oklch(0.85 0.01 130)", label: "Seats open" },
            ]}
          />
        )}
        {showLoanPipeline && (
          <StatRing
            title="Document readiness"
            centerLabel={`${docsPct}%`}
            centerSub="complete"
            segments={[
              { value: docsDone, color: "var(--primary)", label: "Complete" },
              { value: docsPending, color: "var(--destructive)", label: "Incomplete" },
            ]}
            legend={[
              { value: docsDone, color: "var(--primary)", label: "All docs on file" },
              { value: docsPending, color: "var(--destructive)", label: "Still outstanding" },
            ]}
          />
        )}
        {showTrainingFocus && (
          <StatRing
            title="Training progress"
            centerLabel={`${trainingPct}%`}
            centerSub="graduated"
            segments={[
              { value: trainingCompleted, color: "var(--primary)", label: "Done" },
              { value: trainingInProgress, color: "var(--volt)", label: "Active" },
              { value: trainingNotStarted, color: "oklch(0.85 0.01 130)", label: "Not started" },
              { value: trainingFailed, color: "var(--destructive)", label: "Failed" },
            ]}
            legend={[
              { value: trainingCompleted, color: "var(--primary)", label: "Completed" },
              { value: trainingInProgress, color: "var(--volt)", label: "In progress" },
              { value: trainingNotStarted, color: "oklch(0.85 0.01 130)", label: "Not started" },
              { value: trainingFailed, color: "var(--destructive)", label: "Did not pass" },
            ]}
          />
        )}
        {role === "bank_partner" && (
          <>
            <StatRing
              title="Ready for loan review"
              centerLabel={String(readyForReview)}
              centerSub="candidates"
              segments={[
                { value: readyForReview, color: "var(--primary)", label: "Ready" },
                {
                  value: Math.max(0, candidates.length - readyForReview),
                  color: "oklch(0.85 0.01 130)",
                  label: "Not ready",
                },
              ]}
              legend={[
                { value: readyForReview, color: "var(--primary)", label: "Training + docs complete" },
                {
                  value: Math.max(0, candidates.length - readyForReview),
                  color: "oklch(0.85 0.01 130)",
                  label: "Still preparing file",
                },
              ]}
            />
            <StatRing
              title="Loan decisions"
              centerLabel={String(loanApproved)}
              centerSub="approved"
              segments={[
                { value: loanApproved, color: "var(--primary)", label: "Approved" },
                { value: loanInReview, color: "var(--volt)", label: "In review" },
                { value: loanDeclined, color: "var(--destructive)", label: "Declined" },
                {
                  value: Math.max(
                    0,
                    candidates.length - loanApproved - loanInReview - loanDeclined,
                  ),
                  color: "oklch(0.85 0.01 130)",
                  label: "Other",
                },
              ]}
              legend={[
                { value: loanApproved, color: "var(--primary)", label: "Approved" },
                { value: loanInReview, color: "var(--volt)", label: "Pending / in review" },
                { value: loanDeclined, color: "var(--destructive)", label: "Declined" },
              ]}
            />
            <StatRing
              title="CRB blockers"
              centerLabel={String(crbListed)}
              centerSub="listed"
              segments={[
                { value: crbListed, color: "var(--destructive)", label: "Listed" },
                {
                  value: Math.max(0, candidates.length - crbListed),
                  color: "var(--primary)",
                  label: "Clear",
                },
              ]}
              legend={[
                { value: crbListed, color: "var(--destructive)", label: "CRB listing" },
                {
                  value: Math.max(0, candidates.length - crbListed),
                  color: "var(--primary)",
                  label: "No CRB flag",
                },
              ]}
            />
          </>
        )}
      </div>

      {/* System snapshot strip */}
      {showTrainingFocus && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Cohorts open", value: openCohorts, hint: `${closedCohorts} closed` },
            { label: "Applications", value: candidates.length, hint: "all statuses" },
            { label: "In training", value: trainingInProgress, hint: "active sessions" },
            { label: "Seat fill", value: `${seatPct}%`, hint: `${seated} of ${capacity}` },
          ].map((item) => (
            <Card key={item.label} className="border-border/70 p-4 sm:p-5">
              <p className="text-eyebrow text-muted-foreground">{item.label}</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Histograms & charts */}
      {showCohortCharts && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/70 p-5 sm:p-6">
            <p className="font-display text-base font-semibold tracking-tight">
              Applications received by cohort
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Total candidates linked to each cohort
            </p>
            <div className="mt-6">
              {applicationsReceivedBars.length > 0 ? (
                <HistogramChart bars={applicationsReceivedBars} height={200} />
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">No cohorts yet.</p>
              )}
            </div>
          </Card>

          <Card className="border-border/70 p-5 sm:p-6">
            <p className="font-display text-base font-semibold tracking-tight">
              Cohort capacity vs filled
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Filled seats, capacity, and waiting list per cohort
            </p>
            <div className="mt-6">
              {capacityGroups.length > 0 ? (
                <GroupedHistogram
                  groups={capacityGroups}
                  series={[
                    { key: "filled", label: "Filled", color: "var(--primary)" },
                    { key: "capacity", label: "Capacity", color: "oklch(0.78 0.02 130)" },
                    { key: "waiting", label: "Waiting", color: "var(--volt)" },
                  ]}
                  height={200}
                />
              ) : (
                <p className="py-10 text-center text-sm text-muted-foreground">No cohorts yet.</p>
              )}
            </div>
          </Card>

          {(role === "admin" || role === "instructor") && (
            <>
              <Card className="border-border/70 p-5 sm:p-6">
                <p className="font-display text-base font-semibold tracking-tight">
                  Application status mix
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  How applications sit across the pipeline
                </p>
                <div className="mt-6">
                  <HistogramChart bars={applicationsByStatus} height={180} />
                </div>
              </Card>

              <Card className="border-border/70 p-5 sm:p-6">
                <p className="font-display text-base font-semibold tracking-tight">
                  Training sessions
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Candidates by training session stage
                </p>
                <div className="mt-6">
                  <HistogramChart bars={trainingSessionBars} height={180} />
                </div>
              </Card>
            </>
          )}

          {showTrainingFocus && (
            <Card className="border-border/70 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-base font-semibold tracking-tight">
                    Cohorts accepting applications
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Open vs closed intake</p>
                </div>
                <DonutChart
                  size={100}
                  strokeWidth={11}
                  centerLabel={String(cohorts.length)}
                  centerSub="cohorts"
                  segments={[
                    { value: openCohorts, color: "var(--primary)", label: "Open" },
                    { value: closedCohorts, color: "oklch(0.85 0.01 130)", label: "Closed" },
                  ]}
                />
              </div>
              <div className="mt-5 space-y-3">
                <HorizontalBar
                  label="Applications open"
                  value={openCohorts}
                  max={Math.max(cohorts.length, 1)}
                  colorClass="bg-primary"
                  display={`${openCohorts} cohorts`}
                />
                <HorizontalBar
                  label="Applications closed"
                  value={closedCohorts}
                  max={Math.max(cohorts.length, 1)}
                  colorClass="bg-muted-foreground/40"
                  display={`${closedCohorts} cohorts`}
                />
              </div>
            </Card>
          )}

          {showTrainingFocus && locationBars.length > 0 && (
            <Card className="border-border/70 p-5 sm:p-6">
              <p className="font-display text-base font-semibold tracking-tight">
                Cohorts by location
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Geographic spread of programmes</p>
              <div className="mt-6">
                <HistogramChart bars={locationBars} height={180} />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Financing / bank partner detail */}
      {(showFinancing || role === "bank_partner") && (
        <div
          className={cn(
            "grid gap-4",
            role === "admin" ? "lg:grid-cols-2" : "lg:grid-cols-2",
          )}
        >
          {showFinancing && (
            <Card className="border-border/70 p-5 sm:p-6">
              <p className="font-display text-base font-semibold tracking-tight">
                Financing readiness
              </p>
              <div className="mt-5 space-y-4">
                <HorizontalBar
                  label="Average deposit available"
                  value={avgDeposit}
                  max={Math.max(avgDeposit, MIN_DEPOSIT, 1)}
                  colorClass="bg-primary"
                  display={`${fmt(avgDeposit)} RWF`}
                />
                <HorizontalBar
                  label="Meet 500K minimum contribution"
                  value={meetsMinDeposit}
                  max={Math.max(candidates.length, 1)}
                  colorClass="bg-volt"
                  display={`${meetsMinDeposit} drivers`}
                />
                <HorizontalBar
                  label="With bank account"
                  value={banked}
                  max={Math.max(candidates.length, 1)}
                  colorClass="bg-primary"
                  display={`${banked} / ${candidates.length}`}
                />
                <HorizontalBar
                  label="Need UZA Access top-up"
                  value={accessSupport}
                  max={Math.max(candidates.length, 1)}
                  colorClass="bg-destructive/70"
                  display={`${accessSupport} / ${candidates.length}`}
                />
              </div>
            </Card>
          )}

          {role === "bank_partner" && (
            <Card className="border-border/70 p-5 sm:p-6">
              <p className="font-display text-base font-semibold tracking-tight">Deposit readiness</p>
              <div className="mt-5 space-y-4">
                <HorizontalBar
                  label="Average deposit available"
                  value={avgDeposit}
                  max={Math.max(avgDeposit, MIN_DEPOSIT, 1)}
                  colorClass="bg-primary"
                  display={`${fmt(avgDeposit)} RWF`}
                />
                <HorizontalBar
                  label="Meet 500K minimum contribution"
                  value={meetsMinDeposit}
                  max={Math.max(candidates.length, 1)}
                  colorClass="bg-volt"
                  display={`${meetsMinDeposit} drivers`}
                />
                <HorizontalBar
                  label="CRB listings to resolve"
                  value={crbListed}
                  max={Math.max(candidates.length, 1)}
                  colorClass="bg-destructive/70"
                  display={`${crbListed} / ${candidates.length}`}
                />
              </div>
            </Card>
          )}

          {showFinancing && (
            <Card className="border-border/70 p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-display text-base font-semibold tracking-tight">
                    Readiness mix
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Bank vs UZA Access support</p>
                </div>
                <DonutChart
                  size={96}
                  strokeWidth={10}
                  centerLabel={String(candidates.length)}
                  centerSub="drivers"
                  segments={[
                    { value: bankOnly, color: "var(--primary)", label: "Bank only" },
                    { value: accessOnly, color: "var(--destructive)", label: "Access only" },
                    { value: bothAccess, color: "var(--volt)", label: "Both" },
                    { value: neither, color: "oklch(0.85 0.01 130)", label: "Neither" },
                  ]}
                />
              </div>
              <div className="mt-5 space-y-3">
                {[
                  {
                    label: "Bank account",
                    value: banked,
                    total: candidates.length,
                    className: "[&>div]:bg-primary",
                  },
                  {
                    label: "UZA Access requested",
                    value: accessSupport,
                    total: candidates.length,
                    className: "[&>div]:bg-destructive",
                  },
                  {
                    label: "No bank account",
                    value: candidates.length - banked,
                    total: candidates.length,
                    className: "[&>div]:bg-muted-foreground/50",
                  },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border/60 px-3 py-3">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-display text-xl font-bold">{item.value}</span>
                    </div>
                    <Progress
                      value={item.total ? (item.value / item.total) * 100 : 0}
                      className={`mt-2 h-1.5 ${item.className}`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {showLoanPipeline && role === "admin" && (
            <Card className="border-border/70 p-5 sm:p-6 lg:col-span-2">
              <p className="font-display text-base font-semibold tracking-tight">Loan pipeline</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Review readiness and decision outcomes
              </p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <HistogramChart
                  bars={[
                    { label: "Ready", value: readyForReview, color: "var(--primary)" },
                    { label: "In review", value: loanInReview, color: "var(--volt)" },
                    { label: "Approved", value: loanApproved, color: "oklch(0.55 0.08 158)" },
                    { label: "Declined", value: loanDeclined, color: "var(--destructive)" },
                    { label: "CRB listed", value: crbListed, color: "oklch(0.58 0.14 40)" },
                  ]}
                  height={180}
                />
                <div className="space-y-4">
                  <HorizontalBar
                    label="Ready for review (training + docs)"
                    value={readyForReview}
                    max={Math.max(candidates.length, 1)}
                    colorClass="bg-primary"
                    display={`${readyForReview} / ${candidates.length}`}
                  />
                  <HorizontalBar
                    label="Loan approved"
                    value={loanApproved}
                    max={Math.max(candidates.length, 1)}
                    colorClass="bg-volt"
                    display={`${loanApproved} / ${candidates.length}`}
                  />
                  <HorizontalBar
                    label="CRB listings"
                    value={crbListed}
                    max={Math.max(candidates.length, 1)}
                    colorClass="bg-destructive/70"
                    display={`${crbListed} / ${candidates.length}`}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
