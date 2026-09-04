import type { CandidateTrackView, TrackMilestoneStatus } from "@/services/candidateService";
import { Card } from "@/components/ui/card";
import { DonutChart, HistogramChart } from "@/components/charts/ChartPrimitives";
import { formatRwf } from "@/utils/financing";
import { cn } from "@/lib/utils";

const MILESTONE_COLORS: Record<TrackMilestoneStatus, string> = {
  complete: "var(--primary)",
  in_progress: "var(--volt)",
  in_review: "var(--volt)",
  action_required: "var(--destructive)",
  blocked: "var(--destructive)",
  pending: "oklch(0.82 0.01 130)",
};

const VALUE =
  "font-display font-light tracking-tight tabular-nums text-foreground";
const VALUE_LG = cn(VALUE, "text-4xl leading-none sm:text-5xl");
const VALUE_MD = cn(VALUE, "text-xl sm:text-2xl");
const NAME = "font-display font-light tracking-tight text-foreground";

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

function milestoneBarValue(status: TrackMilestoneStatus) {
  if (status === "complete") return 100;
  if (status === "in_progress" || status === "in_review") return 55;
  if (status === "action_required" || status === "blocked") return 25;
  return 8;
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
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {title}
          </p>
          <div className="mt-3 flex items-end gap-2">
            <p className={cn(VALUE_LG, toneClass(tone))}>{value}</p>
            {unit && (
              <span className="pb-1 font-display text-base font-light text-muted-foreground sm:text-lg">
                {unit}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm leading-snug text-muted-foreground sm:text-base">{insight}</p>
        </div>
        <DonutChart size={84} strokeWidth={10} centerLabel="" segments={segments} />
      </div>

      <ul className="mt-5 divide-y divide-border/60 border-t border-border/60">
        {rows.map((row) => (
          <li key={row.label} className="flex items-baseline justify-between gap-3 py-2.5">
            <span className={cn(NAME, "min-w-0 text-sm text-muted-foreground sm:text-base")}>
              {row.label}
            </span>
            <span
              className={cn(VALUE_MD, "shrink-0")}
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

  const financeMax = Math.max(vehiclePrice, depositReady, depositRequired, bankFinance, 1);

  return (
    <div className="space-y-8">
      <div>
        <h3 className={cn(NAME, "text-xl sm:text-2xl")}>Status at a glance</h3>
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
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Milestone timeline
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={VALUE_LG}>
                {completedMilestones}
                <span className="text-2xl text-muted-foreground sm:text-3xl">
                  /{track.milestones.length}
                </span>
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                stages complete · {milestonePct}% of programme journey
              </p>
            </div>
          </div>

          <div className="mt-8 w-full">
            <HistogramChart
              height={260}
              bars={track.milestones.map((m, i) => ({
                label: String(i + 1).padStart(2, "0"),
                subLabel: m.label,
                value: milestoneBarValue(m.status),
                color: MILESTONE_COLORS[m.status],
              }))}
              valueFormatter={(n) => `${n}%`}
            />
          </div>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {track.milestones.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center gap-2.5 rounded-lg border border-border/50 px-3 py-2.5"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: MILESTONE_COLORS[m.status] }}
                  aria-hidden
                />
                <span className={cn(NAME, "min-w-0 flex-1 truncate text-sm sm:text-base")}>
                  {String(i + 1).padStart(2, "0")} · {m.label}
                </span>
                <span className="shrink-0 font-display text-xs font-light capitalize text-muted-foreground">
                  {m.status.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="border-border/70 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Financing breakdown
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={VALUE_LG}>
                {vehiclePrice ? formatRwf(vehiclePrice, { compact: true }) : "—"}
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                target vehicle · deposit cover{" "}
                <span
                  className={cn(
                    "font-display font-light",
                    depositTone === "good" ? "text-primary" : "text-destructive",
                  )}
                >
                  {depositRequired ? `${depositPct}%` : "—"}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className={VALUE_MD}>
                {vehiclePrice ? formatRwf(bankFinance, { compact: true }) : "—"}
              </p>
              <p className="text-sm text-muted-foreground">est. bank finance</p>
            </div>
          </div>

          <div className="mt-8 w-full">
            <HistogramChart
              height={260}
              bars={[
                {
                  label: "Vehicle",
                  subLabel: "Target",
                  value: vehiclePrice,
                  color: "oklch(0.35 0.04 158)",
                },
                {
                  label: "Ready",
                  subLabel: "Deposit",
                  value: depositReady,
                  color: "var(--primary)",
                },
                {
                  label: "Required",
                  subLabel: "Deposit",
                  value: depositRequired,
                  color: "var(--volt)",
                },
                {
                  label: "Bank",
                  subLabel: "Est. finance",
                  value: bankFinance,
                  color: "oklch(0.55 0.02 130)",
                },
              ].map((b) => ({ ...b, value: Math.max(b.value, 0) }))}
              valueFormatter={(n) =>
                n >= financeMax * 0.01 || n === 0
                  ? formatRwf(n, { compact: true })
                  : formatRwf(n, { compact: true })
              }
            />
          </div>

          {track.financing.needs_uza_access_support && (
            <p className="mt-5 rounded-xl border border-volt/30 bg-volt/10 px-4 py-3 text-sm leading-relaxed text-foreground sm:text-base">
              UZA Access top-up requested — gap may be bridged after bank review.
            </p>
          )}
        </Card>
      </div>

      {track.approvals.length > 0 && (
        <Card className="border-border/70 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Action items
              </p>
              <p
                className={cn(
                  VALUE_LG,
                  "mt-3",
                  approvalAction > 0 ? "text-destructive" : "text-primary",
                )}
              >
                {approvalAction}
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                need action · {approvalComplete} done · {approvalPending} pending
              </p>
            </div>
            <DonutChart
              size={100}
              strokeWidth={10}
              centerLabel={`${track.approvals.length}`}
              centerSub="items"
              segments={[
                {
                  value: approvalComplete || 0.001,
                  color: "var(--primary)",
                  label: "Done",
                },
                {
                  value: approvalAction || 0.001,
                  color: "var(--destructive)",
                  label: "Action",
                },
                {
                  value: approvalPending || 0.001,
                  color: "oklch(0.82 0.01 130)",
                  label: "Pending",
                },
              ]}
            />
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <ActionChecklist
              title="Action required"
              count={approvalAction}
              empty="Nothing needs your attention right now."
              tone="bad"
              items={track.approvals
                .filter((a) => a.status === "action_required" || a.status === "blocked")
                .map((a) => ({
                  key: `${a.type}-${a.label}`,
                  label: a.label,
                  detail: a.detail,
                  status: a.status.replace(/_/g, " "),
                }))}
            />
            <ActionChecklist
              title="Pending"
              count={approvalPending}
              empty="No pending items."
              tone="neutral"
              items={track.approvals
                .filter((a) => a.status === "pending")
                .map((a) => ({
                  key: `${a.type}-${a.label}`,
                  label: a.label,
                  detail: a.detail,
                  status: "pending",
                }))}
            />
            <ActionChecklist
              title="In progress / done"
              count={
                approvalComplete +
                track.approvals.filter((a) =>
                  ["in_progress", "in_review"].includes(a.status),
                ).length
              }
              empty="No completed or active items yet."
              tone="good"
              items={track.approvals
                .filter((a) =>
                  ["complete", "in_progress", "in_review"].includes(a.status),
                )
                .map((a) => ({
                  key: `${a.type}-${a.label}`,
                  label: a.label,
                  detail: a.detail,
                  status: a.status.replace(/_/g, " "),
                }))}
            />
          </div>
        </Card>
      )}
    </div>
  );
}

function ActionChecklist({
  title,
  count,
  empty,
  tone,
  items,
}: {
  title: string;
  count: number;
  empty: string;
  tone: "good" | "bad" | "neutral";
  items: { key: string; label: string; detail: string; status: string }[];
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        tone === "good" && "border-primary/25 bg-primary/[0.04]",
        tone === "bad" && "border-destructive/25 bg-destructive/[0.04]",
        tone === "neutral" && "border-border/70 bg-muted/30",
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-display text-base font-light tracking-tight sm:text-lg">{title}</h4>
        <span
          className={cn(
            "font-display text-2xl font-light tabular-nums",
            tone === "good" && "text-primary",
            tone === "bad" && "text-destructive",
          )}
        >
          {count}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="rounded-lg border border-border/40 bg-background/80 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-w-0 font-display text-sm font-light tracking-tight sm:text-base">
                  {item.label}
                </p>
                <span
                  className={cn(
                    "shrink-0 font-display text-xs font-light capitalize tracking-wide",
                    tone === "good" && "text-primary",
                    tone === "bad" && "text-destructive",
                    tone === "neutral" && "text-muted-foreground",
                  )}
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
