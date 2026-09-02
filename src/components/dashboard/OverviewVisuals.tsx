import type { Cohort } from "@/services/cohortService";
import type { StaffRole } from "@/services/authService";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DonutChart,
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

function fmt(n: number) {
  return new Intl.NumberFormat("en-RW").format(Math.round(n));
}

function docsComplete(c: Candidate) {
  return DOC_KEYS.every((k) => c[k] === true);
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

  const showFinancing = role === "admin";
  const showTrainingFocus = role === "admin" || role === "instructor";
  const showLoanPipeline = role === "admin" || role === "bank_partner";
  const statGridCols =
    role === "instructor" ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-4";
  const detailGridCols =
    role === "admin" ? "lg:grid-cols-2" : role === "bank_partner" ? "lg:grid-cols-2" : "grid-cols-1";

  return (
    <div className={cn("flex min-h-0 flex-col gap-5 overflow-y-auto lg:overflow-hidden", className)}>
      <div className={cn("grid shrink-0 gap-4", statGridCols)}>
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

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {(role === "admin" || role === "instructor" || role === "bank_partner") && (
          <Card className="flex max-h-[40%] min-h-0 flex-col overflow-hidden border-border/70 p-0 lg:max-h-none lg:flex-[1.2]">
            <div className="shrink-0 border-b border-border/60 px-5 py-4 sm:px-6">
              <p className="text-eyebrow text-muted-foreground">Cohort capacity</p>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cohort</TableHead>
                    <TableHead className="text-right">Filled</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead className="text-right">Waiting</TableHead>
                    <TableHead className="min-w-[9rem]">Fill</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohorts.map((c) => {
                    const inCohort = candidates.filter((x) => x.cohort_id === c.id);
                    const filled = inCohort.filter(
                      (x) => x.status === "enrolled" || x.status === "graduated",
                    ).length;
                    const waiting = inCohort.filter((x) => x.status === "waitlisted").length;
                    const pct = Math.min(100, Math.round((filled / Math.max(c.capacity, 1)) * 100));
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{c.name}</p>
                            <p className="truncate text-sm text-muted-foreground">{c.code}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{filled}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {c.capacity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {waiting}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-2.5 flex-1" />
                            <span className="w-10 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                              {pct}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {cohorts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                        No cohorts yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {(showFinancing || role === "bank_partner") && (
          <div className={cn("grid min-h-0 flex-1 gap-4", detailGridCols)}>
            {showFinancing && (
              <Card className="flex min-h-0 flex-col border-border/70 p-5 sm:p-6">
                <p className="shrink-0 text-eyebrow text-muted-foreground">Financing readiness</p>
                <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
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
              <Card className="flex min-h-0 flex-col border-border/70 p-5 sm:p-6">
                <p className="shrink-0 text-eyebrow text-muted-foreground">Deposit readiness</p>
                <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
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
              <Card className="flex min-h-0 flex-col border-border/70 p-5 sm:p-6">
                <div className="flex shrink-0 flex-wrap items-end justify-between gap-4">
                  <p className="text-eyebrow text-muted-foreground">Readiness mix</p>
                  <DonutChart
                    size={96}
                    strokeWidth={10}
                    centerLabel={String(candidates.length)}
                    centerSub="drivers"
                    segments={[
                      { value: bankOnly, color: "var(--primary)", label: "Bank only" },
                      { value: accessOnly, color: "var(--destructive)", label: "Access only" },
                      {
                        value: candidates.filter(
                          (c) => c.has_bank_account && c.needs_uza_access_support,
                        ).length,
                        color: "var(--volt)",
                        label: "Both",
                      },
                      { value: neither, color: "oklch(0.85 0.01 130)", label: "Neither" },
                    ]}
                  />
                </div>
                <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
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
          </div>
        )}
      </div>
    </div>
  );
}
