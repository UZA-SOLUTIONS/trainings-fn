import type { CandidateTrackView, TrackMilestoneStatus } from "@/services/candidateService";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  DonutChart,
  HorizontalBar,
  StatRing,
} from "@/components/charts/ChartPrimitives";
import { formatRwf } from "@/utils/financing";
import { cn } from "@/lib/utils";

const MILESTONE_COLORS: Record<TrackMilestoneStatus, string> = {
  complete: "var(--primary)",
  in_progress: "var(--volt)",
  in_review: "var(--volt)",
  action_required: "var(--destructive)",
  blocked: "var(--destructive)",
  pending: "oklch(0.85 0.01 130)",
};

function milestoneProgressPercent(milestones: CandidateTrackView["milestones"]) {
  if (!milestones.length) return 0;
  const complete = milestones.filter((m) => m.status === "complete").length;
  return Math.round((complete / milestones.length) * 100);
}

function trainingReadinessPercent(training: CandidateTrackView["training"]) {
  if (training.status === "completed") return 100;
  if (training.status === "not_started") return 0;
  const scores = [training.attendance_percentage, training.exam_score].filter(
    (v): v is number => v != null,
  );
  if (!scores.length) return training.status === "in_progress" ? 35 : 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export function TrackVisualDashboard({ track }: { track: CandidateTrackView }) {
  const milestonePct = milestoneProgressPercent(track.milestones);
  const completedMilestones = track.milestones.filter((m) => m.status === "complete").length;
  const activeMilestones = track.milestones.filter((m) =>
    ["in_progress", "in_review"].includes(m.status),
  ).length;
  const pendingMilestones =
    track.milestones.length - completedMilestones - activeMilestones;

  const docsReceived = track.documents.filter((d) => d.complete).length;
  const docsNeeded = track.documents.filter((d) => !d.complete && d.required).length;
  const docsOptional = track.documents.filter(
    (d) => !d.complete && !d.required,
  ).length;

  const depositRequired = track.financing.deposit_required_rwf ?? 0;
  const depositReady = track.financing.deposit_available_rwf ?? 0;
  const depositPct =
    depositRequired > 0 ? Math.min(100, Math.round((depositReady / depositRequired) * 100)) : 0;
  const depositGap = Math.max(0, depositRequired - depositReady);

  const trainingPct = trainingReadinessPercent(track.training);
  const vehiclePrice = track.financing.target_vehicle_price_rwf || 0;
  const bankFinance = Math.max(0, vehiclePrice - depositReady);

  const approvalComplete = track.approvals.filter((a) => a.status === "complete").length;
  const approvalAction = track.approvals.filter((a) =>
    ["action_required", "blocked"].includes(a.status),
  ).length;
  const approvalPending = track.approvals.length - approvalComplete - approvalAction;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatRing
          title="Programme journey"
          centerLabel={`${milestonePct}%`}
          centerSub="complete"
          segments={[
            { value: completedMilestones, color: "var(--primary)", label: "Done" },
            { value: activeMilestones, color: "var(--volt)", label: "Active" },
            { value: pendingMilestones, color: "oklch(0.85 0.01 130)", label: "Pending" },
          ]}
          legend={[
            { value: completedMilestones, color: "var(--primary)", label: "Complete" },
            { value: activeMilestones, color: "var(--volt)", label: "In progress" },
            { value: pendingMilestones, color: "oklch(0.85 0.01 130)", label: "Pending" },
          ]}
        />
        <StatRing
          title="Document file"
          centerLabel={`${track.documents_summary.percent}%`}
          centerSub="on file"
          segments={[
            { value: docsReceived, color: "var(--primary)", label: "Received" },
            { value: docsNeeded, color: "var(--destructive)", label: "Needed" },
            { value: docsOptional, color: "oklch(0.75 0.02 130)", label: "Optional" },
          ]}
          legend={[
            { value: docsReceived, color: "var(--primary)", label: "Received" },
            { value: docsNeeded, color: "var(--destructive)", label: "Still needed" },
            { value: docsOptional, color: "oklch(0.75 0.02 130)", label: "Optional" },
          ]}
        />
        <StatRing
          title="Deposit readiness"
          centerLabel={depositRequired ? `${depositPct}%` : "—"}
          centerSub="of required"
          segments={[
            { value: Math.min(depositReady, depositRequired || depositReady), color: "var(--primary)", label: "Ready" },
            { value: depositGap, color: "var(--destructive)", label: "Gap" },
          ]}
          legend={[
            {
              value: depositReady ? formatRwf(depositReady) : "—",
              color: "var(--primary)",
              label: "Deposit ready",
            },
            {
              value: depositRequired ? formatRwf(depositRequired) : "—",
              color: "var(--destructive)",
              label: "Required",
            },
          ]}
        />
        <StatRing
          title="Training readiness"
          centerLabel={`${trainingPct}%`}
          centerSub={track.training.status.replace(/_/g, " ")}
          segments={[
            { value: trainingPct, color: "var(--volt)", label: "Ready" },
            { value: 100 - trainingPct, color: "oklch(0.85 0.01 130)", label: "Remaining" },
          ]}
          legend={[
            {
              value: track.training.attendance_percentage != null ? `${track.training.attendance_percentage}%` : "—",
              color: "var(--volt)",
              label: "Attendance",
            },
            {
              value: track.training.exam_score != null ? `${track.training.exam_score}%` : "—",
              color: "var(--primary)",
              label: "Exam score",
            },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 p-5 sm:p-6">
          <p className="text-eyebrow text-muted-foreground">Milestone timeline</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {completedMilestones} of {track.milestones.length} stages complete
          </p>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-muted">
            {track.milestones.map((m) => (
              <div
                key={m.id}
                className="h-full min-w-[4px] flex-1 border-r border-background/50 last:border-r-0"
                style={{ backgroundColor: MILESTONE_COLORS[m.status] }}
                title={`${m.label}: ${m.status.replace(/_/g, " ")}`}
              />
            ))}
          </div>
          <ul className="mt-5 space-y-3">
            {track.milestones.map((m) => (
              <li key={m.id}>
                <div className="mb-1 flex justify-between gap-2 text-xs">
                  <span className="truncate font-medium">{m.label}</span>
                  <span className="shrink-0 capitalize text-muted-foreground">
                    {m.status.replace(/_/g, " ")}
                  </span>
                </div>
                <Progress
                  value={
                    m.status === "complete"
                      ? 100
                      : m.status === "in_progress" || m.status === "in_review"
                        ? 55
                        : m.status === "action_required" || m.status === "blocked"
                          ? 25
                          : 8
                  }
                  className={cn(
                    "h-1.5",
                    m.status === "complete" && "[&>div]:bg-primary",
                    (m.status === "in_progress" || m.status === "in_review") && "[&>div]:bg-volt",
                    (m.status === "action_required" || m.status === "blocked") &&
                      "[&>div]:bg-destructive",
                  )}
                />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-border/70 p-5 sm:p-6">
          <p className="text-eyebrow text-muted-foreground">Financing breakdown</p>
          <p className="mt-1 text-sm text-muted-foreground">
            How your target vehicle price is covered
          </p>
          <div className="mt-6 space-y-4">
            <HorizontalBar
              label="Target vehicle"
              value={vehiclePrice}
              max={vehiclePrice}
              colorClass="bg-foreground/70"
              display={vehiclePrice ? formatRwf(vehiclePrice) : "—"}
            />
            <HorizontalBar
              label="Your deposit ready"
              value={depositReady}
              max={vehiclePrice}
              colorClass="bg-primary"
              display={depositReady ? formatRwf(depositReady) : "—"}
            />
            <HorizontalBar
              label="Deposit required (min.)"
              value={depositRequired}
              max={vehiclePrice}
              colorClass="bg-volt"
              display={depositRequired ? formatRwf(depositRequired) : "—"}
            />
            <HorizontalBar
              label="Bank finance (est.)"
              value={bankFinance}
              max={vehiclePrice}
              colorClass="bg-muted-foreground/50"
              display={vehiclePrice ? formatRwf(bankFinance) : "—"}
            />
          </div>
          {track.financing.needs_uza_access_support && (
            <p className="mt-4 rounded-lg border border-volt/30 bg-volt/10 px-3 py-2 text-xs text-foreground">
              UZA Access top-up requested — gap may be bridged after bank review.
            </p>
          )}
        </Card>
      </div>

      {track.approvals.length > 0 && (
        <Card className="border-border/70 p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-eyebrow text-muted-foreground">Action items</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Status overview for pending approvals
              </p>
            </div>
            <DonutChart
              size={88}
              strokeWidth={9}
              centerLabel={String(track.approvals.length)}
              centerSub="items"
              segments={[
                { value: approvalComplete, color: "var(--primary)", label: "Done" },
                { value: approvalAction, color: "var(--destructive)", label: "Action" },
                { value: approvalPending, color: "oklch(0.85 0.01 130)", label: "Pending" },
              ]}
            />
          </div>
          <ul className="mt-5 space-y-4">
            {track.approvals.map((item) => {
              const barValue =
                item.status === "complete"
                  ? 100
                  : item.status === "action_required" || item.status === "blocked"
                    ? 30
                    : item.status === "in_progress" || item.status === "in_review"
                      ? 60
                      : 15;
              return (
                <li key={`${item.type}-${item.label}`}>
                  <div className="mb-1.5 flex justify-between gap-2 text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="shrink-0 capitalize text-muted-foreground">
                      {item.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <Progress
                    value={barValue}
                    className={cn(
                      "h-2",
                      item.status === "complete" && "[&>div]:bg-primary",
                      (item.status === "in_progress" || item.status === "in_review") &&
                        "[&>div]:bg-volt",
                      (item.status === "action_required" || item.status === "blocked") &&
                        "[&>div]:bg-destructive",
                    )}
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">{item.detail}</p>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
