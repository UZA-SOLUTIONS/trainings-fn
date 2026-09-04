import type { CandidateTrackView, TrackMilestoneStatus } from "@/services/candidateService";
import { Card } from "@/components/ui/card";
import { DonutChart, HistogramChart } from "@/components/charts/ChartPrimitives";
import { formatRwf } from "@/utils/financing";
import { cn } from "@/lib/utils";
import { resolveTrackGarage, resolveTrackWallet, resolveTrackFinancing } from "@/components/home/trackFallbacks";

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
  insight?: string;
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
          {insight ? (
            <p className="mt-3 text-sm leading-snug text-muted-foreground sm:text-base">{insight}</p>
          ) : null}
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

  const financing = resolveTrackFinancing(track);
  const depositOffered = financing.deposit_offered_rwf;
  const depositTenPercent = financing.deposit_ten_percent_rwf;
  const remainingToTen = financing.remaining_to_ten_percent_rwf;
  const bankPays = financing.bank_ninety_percent_rwf;
  const depositPct = financing.deposit_pct;
  const depositGap = financing.deposit_gap_rwf;
  // Alias for existing deposit-readiness KPI
  const depositRequired = depositTenPercent;
  const depositReady = depositOffered;

  const trainingPct = trainingReadinessPercent(track.training);
  const vehiclePrice = financing.target_vehicle_price_rwf || 0;
  const bankFinance = bankPays;

  const journeyTone: Tone =
    milestonePct >= 70 ? "good" : actionMilestones > 0 ? "bad" : milestonePct > 0 ? "warn" : "neutral";
  const docsTone: Tone =
    docsNeeded === 0 ? "good" : docsNeeded >= 5 ? "bad" : docsReceived > 0 ? "warn" : "bad";
  const depositTone: Tone =
    !depositRequired ? "neutral" : depositPct >= 100 ? "good" : depositPct >= 50 ? "warn" : "bad";
  const trainingTone: Tone =
    trainingPct >= 80 ? "good" : trainingPct > 0 ? "warn" : "neutral";

  const wallet = resolveTrackWallet(track);
  const garage = resolveTrackGarage(track);
  const walletAvailable = wallet.balances?.available_rwf ?? 0;
  const garageScore = garage.health?.overall_score ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h3 className={cn(NAME, "text-xl sm:text-2xl")}>Status at a glance</h3>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnalysisKpi
          title="Wallet app"
          value={`${walletAvailable}`}
          unit="RWF"
          tone="neutral"
          insight={`MoMo ${wallet.app_numbers?.momo ?? "0"} · Airtel ${wallet.app_numbers?.airtel ?? "0"} · UZA ${wallet.app_numbers?.uza_wallet ?? "0"}`}
          segments={[{ value: 1, color: "oklch(0.85 0.01 130)", label: "Awaiting ledger" }]}
          rows={[
            { label: "Available", value: formatRwf(walletAvailable, { compact: true }) },
            {
              label: "Savings locked",
              value: formatRwf(wallet.balances?.savings_locked_rwf ?? 0, { compact: true }),
            },
            {
              label: "Commission owed",
              value: formatRwf(wallet.balances?.commission_owed_rwf ?? 0, { compact: true }),
            },
          ]}
        />
        <AnalysisKpi
          title="Garage health"
          value={`${garageScore}`}
          unit="/100"
          tone={
            garage.live
              ? garageScore >= 70
                ? "good"
                : garageScore > 0
                  ? "warn"
                  : "bad"
              : "neutral"
          }
          insight={
            garage.live
              ? `${garage.health.status} · SOH ${garage.health.battery_soh_percent}% · ${garage.health.fault_codes_count} DTCs`
              : undefined
          }
          segments={[
            { value: Math.max(garageScore, 1), color: "var(--volt)", label: "Score" },
            {
              value: Math.max(100 - garageScore, 1),
              color: "oklch(0.85 0.01 130)",
              label: "Gap",
            },
          ]}
          rows={[
            { label: "Battery SOH", value: `${garage.health.battery_soh_percent}%` },
            { label: "Motor", value: `${garage.health.motor_health_percent}%` },
            { label: "Faults", value: String(garage.health.fault_codes_count ?? 0) },
          ]}
        />
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
          value={
            !depositRequired
              ? "—"
              : remainingToTen > 0
                ? formatRwf(remainingToTen, { compact: true }).replace(" RWF", "")
                : `${depositPct}`
          }
          unit={!depositRequired ? undefined : remainingToTen > 0 ? "RWF" : "%"}
          tone={depositTone}
          segments={[
            {
              value: Math.min(depositReady, depositRequired || depositReady || 1),
              color: "var(--primary)",
              label: "Offered",
            },
            { value: depositGap || 0.0001, color: "var(--destructive)", label: "Left to pay" },
          ]}
          rows={[
            {
              label: "Offered",
              value: depositReady ? formatRwf(depositReady, { compact: true }) : "—",
              accent: "var(--primary)",
            },
            {
              label: "10% of car price",
              value: depositRequired
                ? formatRwf(depositRequired, { compact: true })
                : "—",
            },
            {
              label: remainingToTen > 0 ? "Left to pay" : "Fully covered",
              value:
                remainingToTen > 0
                  ? formatRwf(remainingToTen, { compact: true })
                  : formatRwf(0, { compact: true }),
              accent: remainingToTen > 0 ? "var(--destructive)" : "var(--primary)",
            },
          ]}
        />

        <AnalysisKpi
          title="Bank financing"
          value={bankPays ? formatRwf(bankPays, { compact: true }).replace(" RWF", "") : "—"}
          unit={bankPays ? "RWF" : undefined}
          tone={bankPays ? "good" : "neutral"}
          segments={[
            {
              value: depositOffered || 1,
              color: "var(--primary)",
              label: "Contribution",
            },
            {
              value: bankPays || 1,
              color: "var(--volt)",
              label: "Bank pays",
            },
          ]}
          rows={[
            {
              label: "Vehicle price",
              value: vehiclePrice ? formatRwf(vehiclePrice, { compact: true }) : "—",
            },
            {
              label: "Candidate offered",
              value: depositOffered
                ? formatRwf(depositOffered, { compact: true })
                : "—",
              accent: "var(--primary)",
            },
            {
              label: "Bank pays (remaining)",
              value: bankPays ? formatRwf(bankPays, { compact: true }) : "—",
              accent: "var(--volt)",
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

      <Card className="border-border/70 p-6 sm:p-8">
        <p className={cn(NAME, "text-xl sm:text-2xl")}>Milestone timeline</p>
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

        <div className="mt-8 w-full min-w-0">
          <HistogramChart
            height={320}
            minSlotWidth={110}
            bars={track.milestones.map((m, i) => ({
              label: String(i + 1).padStart(2, "0"),
              subLabel: m.label,
              value: milestoneBarValue(m.status),
              color: MILESTONE_COLORS[m.status],
            }))}
            valueFormatter={(n) => `${n}%`}
          />
        </div>
      </Card>

      <Card className="border-border/70 p-6 sm:p-8">
        <p className={cn(NAME, "text-xl sm:text-2xl")}>Financing breakdown</p>
        <p className="mt-2 text-base text-muted-foreground">
          {financing.target_vehicle_name
            ? `EV of choice · ${financing.target_vehicle_name}`
            : "Vehicle financing"}
          {vehiclePrice > 0 ? ` · ${formatRwf(vehiclePrice, { compact: true })}` : ""}
          {" · "}
          bank pays price − contribution
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-5">
            <p className="font-display text-base font-light text-muted-foreground">
              Deposit offered
            </p>
            <p className={cn(VALUE_LG, "mt-2 text-primary")}>
              {formatRwf(depositOffered, { compact: true })}
            </p>
          </div>
          <div
            className={cn(
              "rounded-xl border px-4 py-5",
              remainingToTen > 0
                ? "border-destructive/25 bg-destructive/[0.06]"
                : "border-primary/25 bg-primary/[0.06]",
            )}
          >
            <p className="font-display text-base font-light text-muted-foreground">
              Remaining to 10%
            </p>
            <p
              className={cn(
                VALUE_LG,
                "mt-2",
                remainingToTen > 0 ? "text-destructive" : "text-primary",
              )}
            >
              {formatRwf(remainingToTen, { compact: true })}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/30 px-4 py-5">
            <p className="font-display text-base font-light text-muted-foreground">
              Bank pays (remaining)
            </p>
            <p className={cn(VALUE_LG, "mt-2")}>
              {vehiclePrice > 0 ? formatRwf(bankPays, { compact: true }) : "—"}
            </p>
          </div>
        </div>

        <div className="mt-8 w-full">
          <HistogramChart
            height={280}
            minSlotWidth={110}
            bars={[
              {
                label: "Vehicle",
                subLabel: "Price",
                value: vehiclePrice,
                color: "oklch(0.35 0.04 158)",
              },
              {
                label: "Offered",
                subLabel: "Deposit",
                value: depositOffered,
                color: "var(--primary)",
              },
              {
                label: "To 10%",
                subLabel: "Remaining",
                value: remainingToTen,
                color: "var(--destructive)",
              },
              {
                label: "Bank",
                subLabel: "Remaining",
                value: bankPays,
                color: "var(--volt)",
              },
            ].map((b) => ({ ...b, value: Math.max(Number(b.value) || 0, 0) }))}
            valueFormatter={(n) => formatRwf(n, { compact: true })}
          />
        </div>

        <dl className="mt-6 grid gap-3 border-t border-border/60 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm text-muted-foreground">Vehicle price</dt>
            <dd className={cn(VALUE_MD, "mt-1")}>
              {vehiclePrice > 0 ? formatRwf(vehiclePrice, { compact: true }) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">10% deposit target</dt>
            <dd className={cn(VALUE_MD, "mt-1")}>
              {depositTenPercent > 0 ? formatRwf(depositTenPercent, { compact: true }) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Covered of 10%</dt>
            <dd
              className={cn(
                VALUE_MD,
                "mt-1",
                depositPct >= 100 ? "text-primary" : "text-destructive",
              )}
            >
              {depositTenPercent > 0 ? `${depositPct}%` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Term</dt>
            <dd className={cn(VALUE_MD, "mt-1")}>
              {financing.preferred_term_years != null
                ? `${financing.preferred_term_years} yrs`
                : "—"}
            </dd>
          </div>
        </dl>

        {financing.needs_uza_access_support && (
          <p className="mt-5 rounded-xl border border-volt/30 bg-volt/10 px-4 py-3 text-sm leading-relaxed text-foreground sm:text-base">
            UZA Access top-up requested — can cover the remaining deposit gap to reach 10%.
          </p>
        )}
      </Card>

    </div>
  );
}
