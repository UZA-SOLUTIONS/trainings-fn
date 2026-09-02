import type { CandidateTrackView, TrackMilestoneStatus } from "@/services/candidateService";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DonutChart } from "@/components/charts/ChartPrimitives";
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

type Tone = "good" | "warn" | "bad" | "neutral";

function toneClass(tone: Tone) {
  if (tone === "good") return "text-primary";
  if (tone === "warn") return "text-foreground";
  if (tone === "bad") return "text-destructive";
  return "text-foreground";
}

function AnalysisKpi({
  title,
  value,
  unit,
  insight,
  tone = "neutral",
  segments,
  rows,
}: {
  title: string;
  value: string;
  unit?: string;
  insight: string;
  tone?: Tone;
  segments: { value: number; color: string; label: string }[];
  rows: { label: string; value: string; accent?: string }[];
}) {
  return (
    <Card className="flex min-w-0 flex-col border-border/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {title}
          </p>
          <div className="mt-3 flex items-end gap-2">
            <p
              className={cn(
                "font-display text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl",
                toneClass(tone),
              )}
            >
              {value}
            </p>
            {unit && (
              <span className="pb-1 text-base font-semibold text-muted-foreground sm:text-lg">
                {unit}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-snug text-muted-foreground sm:text-base">{insight}</p>
        </div>
        <DonutChart
          size={84}
          strokeWidth={10}
          centerLabel=""
          segments={segments}
        />
      </div>

      <ul className="mt-5 divide-y divide-border/60 border-t border-border/60">
        {rows.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between gap-3 py-2.5">
            <span className="min-w-0 text-sm text-muted-foreground sm:text-base">{row.label}</span>
            <span
              className="shrink-0 font-display text-xl font-bold tabular-nums sm:text-2xl"
              style={row.accent ? { color: row.accent } : undefined}
            >
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function TrackVisualDashboard({ track }: { track: CandidateTrackView }) {
  const milestonePct = milestoneProgressPercent(track.milestones);
  const completedMilestones = track.milestones.filter((m) => m.status === "complete").length;
  const activeMilestones = track.milestones.filter((m) =>
    ["in_progress", "in_review"].includes(m.status),
  ).length;
  const actionMilestones = track.milestones.filter((m) =>
    ["action_required", "blocked"].includes(m.status),
  ).length;
  const pendingMilestones =
    track.milestones.length - completedMilestones - activeMilestones - actionMilestones;

  const docsReceived = track.documents.filter((d) => d.complete).length;
  const docsNeeded = track.documents.filter((d) => !d.complete && d.required).length;
  const docsOptional = track.documents.filter((d) => !d.complete && !d.required).length;

  const depositRequired = track.financing.deposit_required_rwf ?? 0;
  const depositReady = track.financing.deposit_available_rwf ?? 0;
  const depositPct =
    depositRequired > 0 ? Math.min(100, Math.round((depositReady / depositRequired) * 100)) : 0;
  const depositGap = Math.max(0, depositRequired - depositReady);
  const depositSurplus = Math.max(0, depositReady - depositRequired);

  const trainingPct = trainingReadinessPercent(track.training);
  const vehiclePrice = track.financing.target_vehicle_price_rwf || 0;
  const bankFinance = Math.max(0, vehiclePrice - depositReady);

  const approvalComplete = track.approvals.filter((a) => a.status === "complete").length;
  const approvalAction = track.approvals.filter((a) =>
    ["action_required", "blocked"].includes(a.status),
  ).length;
  const approvalPending = track.approvals.length - approvalComplete - approvalAction;

  const journeyTone: Tone =
    milestonePct >= 70 ? "good" : actionMilestones > 0 ? "bad" : milestonePct > 0 ? "warn" : "neutral";
  const docsTone: Tone =
    docsNeeded === 0 ? "good" : docsNeeded >= 5 ? "bad" : docsReceived > 0 ? "warn" : "bad";
  const depositTone: Tone =
    !depositRequired ? "neutral" : depositPct >= 100 ? "good" : depositPct >= 50 ? "warn" : "bad";
  const trainingTone: Tone =
    trainingPct >= 80 ? "good" : trainingPct > 0 ? "warn" : "neutral";

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
          Status at a glance
        </h3>
        <p className="mt-1 text-base text-muted-foreground">
          Key numbers for programme, documents, deposit, and training.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <AnalysisKpi
          title="Programme journey"
          value={`${milestonePct}`}
          unit="%"
          tone={journeyTone}
          insight={`${completedMilestones} of ${track.milestones.length} stages done${
            activeMilestones ? ` · ${activeMilestones} active` : ""
          }${actionMilestones ? ` · ${actionMilestones} need action` : ""}`}
          segments={[
            { value: completedMilestones, color: "var(--primary)", label: "Done" },
            { value: activeMilestones, color: "var(--volt)", label: "Active" },
            { value: actionMilestones, color: "var(--destructive)", label: "Action" },
            { value: pendingMilestones, color: "oklch(0.85 0.01 130)", label: "Pending" },
          ]}
          rows={[
            { label: "Complete", value: String(completedMilestones), accent: "var(--primary)" },
            { label: "In progress", value: String(activeMilestones), accent: "var(--volt)" },
            { label: "Pending", value: String(pendingMilestones) },
          ]}
        />

        <AnalysisKpi
          title="Document file"
          value={`${track.documents_summary.percent}`}
          unit="%"
          tone={docsTone}
          insight={
            docsNeeded === 0
              ? "All required documents are on file."
              : `${docsNeeded} required document${docsNeeded === 1 ? "" : "s"} still outstanding.`
          }
          segments={[
            { value: docsReceived, color: "var(--primary)", label: "Received" },
            { value: docsNeeded, color: "var(--destructive)", label: "Needed" },
            { value: docsOptional, color: "oklch(0.75 0.02 130)", label: "Optional" },
          ]}
          rows={[
            { label: "Received", value: String(docsReceived), accent: "var(--primary)" },
            { label: "Still needed", value: String(docsNeeded), accent: "var(--destructive)" },
            { label: "Optional left", value: String(docsOptional) },
          ]}
        />

        <AnalysisKpi
          title="Deposit readiness"
          value={depositRequired ? `${depositPct}` : "—"}
          unit={depositRequired ? "%" : undefined}
          tone={depositTone}
          insight={
            !depositRequired
              ? "Deposit requirement not set yet."
              : depositPct >= 100
                ? `Surplus ${formatRwf(depositSurplus, { compact: true })} above minimum.`
                : `Gap of ${formatRwf(depositGap, { compact: true })} to reach the minimum.`
          }
          segments={[
            {
              value: Math.min(depositReady, depositRequired || depositReady || 1),
              color: "var(--primary)",
              label: "Ready",
            },
            { value: depositGap || 0.0001, color: "var(--destructive)", label: "Gap" },
          ]}
          rows={[
            {
              label: "Ready",
              value: depositReady ? formatRwf(depositReady, { compact: true }) : "—",
              accent: "var(--primary)",
            },
            {
              label: "Required",
              value: depositRequired ? formatRwf(depositRequired, { compact: true }) : "—",
            },
            {
              label: depositPct >= 100 ? "Surplus" : "Gap",
              value:
                depositPct >= 100
                  ? formatRwf(depositSurplus, { compact: true })
                  : formatRwf(depositGap, { compact: true }),
              accent: depositPct >= 100 ? "var(--primary)" : "var(--destructive)",
            },
          ]}
        />

        <AnalysisKpi
          title="Training readiness"
          value={`${trainingPct}`}
          unit="%"
          tone={trainingTone}
          insight={
            track.training.status === "not_started"
              ? "Training has not started for this candidate."
              : track.training.status === "completed"
                ? "Training completed — ready for next financing steps."
                : "Training in progress — track attendance and exam score."
          }
          segments={[
            { value: Math.max(trainingPct, 1), color: "var(--volt)", label: "Ready" },
            { value: Math.max(100 - trainingPct, 1), color: "oklch(0.85 0.01 130)", label: "Left" },
          ]}
          rows={[
            {
              label: "Attendance",
              value:
                track.training.attendance_percentage != null
                  ? `${track.training.attendance_percentage}%`
                  : "—",
              accent: "var(--volt)",
            },
            {
              label: "Exam score",
              value:
                track.training.exam_score != null ? `${track.training.exam_score}%` : "—",
              accent: "var(--primary)",
            },
            {
              label: "Status",
              value: track.training.status.replace(/_/g, " "),
            },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Milestone timeline
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl">
                {completedMilestones}
                <span className="text-2xl font-semibold text-muted-foreground sm:text-3xl">
                  /{track.milestones.length}
                </span>
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                stages complete · {milestonePct}% of programme journey
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="font-display text-2xl font-bold tabular-nums text-primary">
                  {completedMilestones}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">Done</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums" style={{ color: "var(--volt)" }}>
                  {activeMilestones}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">Active</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums">{pendingMilestones}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">Pending</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex h-4 overflow-hidden rounded-full bg-muted">
            {track.milestones.map((m) => (
              <div
                key={m.id}
                className="h-full min-w-[4px] flex-1 border-r border-background/50 last:border-r-0"
                style={{ backgroundColor: MILESTONE_COLORS[m.status] }}
                title={`${m.label}: ${m.status.replace(/_/g, " ")}`}
              />
            ))}
          </div>
          <ul className="mt-5 divide-y divide-border/60">
            {track.milestones.map((m, i) => (
              <li key={m.id} className="flex items-center gap-3 py-3.5">
                <span className="w-8 shrink-0 font-display text-lg font-bold tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold sm:text-lg">{m.label}</p>
                  <div className="mt-2">
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
                        "h-2",
                        m.status === "complete" && "[&>div]:bg-primary",
                        (m.status === "in_progress" || m.status === "in_review") && "[&>div]:bg-volt",
                        (m.status === "action_required" || m.status === "blocked") &&
                          "[&>div]:bg-destructive",
                      )}
                    />
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold capitalize",
                    m.status === "complete" && "bg-primary/10 text-primary",
                    (m.status === "in_progress" || m.status === "in_review") &&
                      "bg-volt/15 text-foreground",
                    (m.status === "action_required" || m.status === "blocked") &&
                      "bg-destructive/10 text-destructive",
                    m.status === "pending" && "bg-muted text-muted-foreground",
                  )}
                >
                  {m.status.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-border/70 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Financing breakdown
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl">
                {vehiclePrice ? formatRwf(vehiclePrice, { compact: true }) : "—"}
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                target vehicle · deposit cover{" "}
                <span className={cn("font-bold", depositTone === "good" ? "text-primary" : "text-destructive")}>
                  {depositRequired ? `${depositPct}%` : "—"}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
                {vehiclePrice ? formatRwf(bankFinance, { compact: true }) : "—"}
              </p>
              <p className="text-sm text-muted-foreground">est. bank finance</p>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-border/60 border-t border-border/60">
            {[
              {
                label: "Target vehicle",
                value: vehiclePrice ? formatRwf(vehiclePrice) : "—",
                bar: vehiclePrice,
                max: vehiclePrice || 1,
                color: "bg-foreground/70",
              },
              {
                label: "Deposit ready",
                value: depositReady ? formatRwf(depositReady) : "—",
                bar: depositReady,
                max: Math.max(vehiclePrice, depositReady, 1),
                color: "bg-primary",
              },
              {
                label: "Deposit required",
                value: depositRequired ? formatRwf(depositRequired) : "—",
                bar: depositRequired,
                max: Math.max(vehiclePrice, depositRequired, 1),
                color: "bg-volt",
              },
              {
                label: "Bank finance (est.)",
                value: vehiclePrice ? formatRwf(bankFinance) : "—",
                bar: bankFinance,
                max: Math.max(vehiclePrice, bankFinance, 1),
                color: "bg-muted-foreground/50",
              },
            ].map((row) => (
              <div key={row.label} className="py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-base text-muted-foreground sm:text-lg">{row.label}</dt>
                  <dd className="font-display text-xl font-bold tabular-nums sm:text-2xl">
                    {row.value}
                  </dd>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", row.color)}
                    style={{
                      width: `${Math.min(100, (row.bar / row.max) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </dl>

          {track.financing.needs_uza_access_support && (
            <p className="mt-5 rounded-xl border border-volt/30 bg-volt/10 px-4 py-3 text-sm leading-relaxed text-foreground sm:text-base">
              UZA Access top-up requested — gap may be bridged after bank review.
            </p>
          )}
        </Card>
      </div>

      {track.approvals.length > 0 && (
        <Card className="border-border/70 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Action items
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p
                className={cn(
                  "font-display text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl",
                  approvalAction > 0 ? "text-destructive" : "text-primary",
                )}
              >
                {approvalAction}
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                need action · {approvalComplete} done · {approvalPending} pending
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="font-display text-2xl font-bold tabular-nums text-primary">
                  {approvalComplete}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">Done</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums text-destructive">
                  {approvalAction}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">Action</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold tabular-nums">{approvalPending}</p>
                <p className="text-xs text-muted-foreground sm:text-sm">Pending</p>
              </div>
            </div>
          </div>

          <ul className="mt-6 divide-y divide-border/60 border-t border-border/60">
            {track.approvals.map((item) => (
              <li key={`${item.type}-${item.label}`} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold sm:text-lg">{item.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {item.detail}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold capitalize",
                      item.status === "complete" && "bg-primary/10 text-primary",
                      (item.status === "in_progress" || item.status === "in_review") &&
                        "bg-volt/15 text-foreground",
                      (item.status === "action_required" || item.status === "blocked") &&
                        "bg-destructive/10 text-destructive",
                      item.status === "pending" && "bg-muted text-muted-foreground",
                    )}
                  >
                    {item.status.replace(/_/g, " ")}
                  </span>
                </div>
                <Progress
                  value={
                    item.status === "complete"
                      ? 100
                      : item.status === "action_required" || item.status === "blocked"
                        ? 30
                        : item.status === "in_progress" || item.status === "in_review"
                          ? 60
                          : 15
                  }
                  className={cn(
                    "mt-3 h-2.5",
                    item.status === "complete" && "[&>div]:bg-primary",
                    (item.status === "in_progress" || item.status === "in_review") &&
                      "[&>div]:bg-volt",
                    (item.status === "action_required" || item.status === "blocked") &&
                      "[&>div]:bg-destructive",
                  )}
                />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
