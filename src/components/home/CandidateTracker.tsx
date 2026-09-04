import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import {
  trackLookup,
  type CandidateTrackView,
} from "@/services/candidateService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TrackVisualDashboard } from "@/components/home/TrackVisuals";
import { WalletUsagePanel } from "@/components/home/WalletUsagePanel";
import { GarageHealthPanel } from "@/components/home/GarageHealthPanel";
import { resolveTrackGarage, resolveTrackWallet, resolveTrackFinancing } from "@/components/home/trackFallbacks";
import { DonutChart, HistogramChart } from "@/components/charts/ChartPrimitives";
import { formatRwf } from "@/utils/financing";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  enrolled: "Enrolled",
  waitlisted: "Waiting list",
  rejected: "Not accepted",
  withdrawn: "Withdrawn",
  graduated: "Graduated",
};

const TRAINING_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Did not pass",
};

export function friendlyTrackError(err: unknown): string {
  const message = err instanceof Error ? err.message : "Could not find that application.";
  if (/Route GET .*\/track\//i.test(message)) {
    return "Tracking service is offline. Restart the backend: cd backend && npm start";
  }
  return message;
}

export function CandidateTrackResult({ track }: { track: CandidateTrackView }) {
  const wallet = resolveTrackWallet(track);
  const garage = resolveTrackGarage(track);
  const financing = resolveTrackFinancing(track);

  const trainingPct =
    track.training.status === "completed"
      ? 100
      : track.training.status === "not_started"
        ? 0
        : track.training.attendance_percentage != null && track.training.exam_score != null
          ? Math.round(
              (track.training.attendance_percentage + track.training.exam_score) / 2,
            )
          : track.training.attendance_percentage ??
            (track.training.status === "in_progress" ? 35 : 0);

  const depositRequired = financing.deposit_ten_percent_rwf ?? 0;
  const depositReady = financing.deposit_offered_rwf ?? 0;
  const depositPct = depositRequired > 0 ? financing.deposit_pct : null;
  const vehiclePrice = financing.target_vehicle_price_rwf || 0;
  const bankFinance = financing.bank_ninety_percent_rwf;
  const remainingToTen = financing.remaining_to_ten_percent_rwf;

  const docsProvided = track.documents.filter((d) => d.complete);
  const docsMissing = track.documents.filter((d) => !d.complete && d.required);
  const docsOptional = track.documents.filter((d) => !d.complete && !d.required);

  const valueLg =
    "font-display text-4xl font-light leading-none tracking-tight tabular-nums sm:text-5xl";
  const valueMd = "font-display text-xl font-light tracking-tight tabular-nums sm:text-2xl";
  const nameText = "font-display font-light tracking-tight text-foreground";

  const isCertified =
    track.training.status === "completed" || track.status === "graduated";

  return (
    <div className="space-y-8">
      <Card className="border-border/70 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className={cn(nameText, "text-3xl sm:text-4xl")}>{track.full_name}</h3>
            <p className={cn(valueMd, "mt-2 text-primary")}>{track.candidate_code}</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge
              variant={isCertified ? "default" : "secondary"}
              className={cn(
                "px-3 py-1 text-sm font-light",
                isCertified
                  ? "bg-primary text-primary-foreground"
                  : "border border-destructive/30 bg-destructive/10 text-destructive",
              )}
            >
              {isCertified ? "Certified" : "Not certified"}
            </Badge>
            <Badge
              variant={
                track.status === "enrolled" || track.status === "graduated" ? "default" : "secondary"
              }
              className="px-3 py-1 text-sm font-light"
            >
              {STATUS_LABELS[track.status] ?? track.status}
              {track.waitlist_position ? ` · #${track.waitlist_position}` : ""}
            </Badge>
          </div>
        </div>

        {track.cohort && (
          <dl className="mt-6 grid gap-4 text-base sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 sm:text-lg">
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Cohort
              </dt>
              <dd className={cn(nameText, "mt-1.5 text-base sm:text-lg")}>{track.cohort.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Start
              </dt>
              <dd className={cn(valueMd, "mt-1.5 text-base sm:text-lg")}>
                {track.cohort.start_date ?? "To be confirmed"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Location
              </dt>
              <dd className={cn(nameText, "mt-1.5 text-base sm:text-lg")}>
                {track.cohort.location ?? "TBC"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Partner bank
              </dt>
              <dd className={cn(nameText, "mt-1.5 text-base sm:text-lg")}>
                {track.cohort.partner_bank ?? "Assigned after review"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
                EV of choice
              </dt>
              <dd className={cn(nameText, "mt-1.5 text-base sm:text-lg")}>
                {financing.target_vehicle_name?.trim() || "Not selected yet"}
              </dd>
            </div>
          </dl>
        )}

        {!track.cohort && financing.target_vehicle_name && (
          <dl className="mt-6 grid gap-4 text-base sm:grid-cols-2 sm:text-lg">
            <div>
              <dt className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
                EV of choice
              </dt>
              <dd className={cn(nameText, "mt-1.5 text-base sm:text-lg")}>
                {financing.target_vehicle_name}
              </dd>
            </div>
          </dl>
        )}

        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          Current stage:{" "}
          <span className={cn(nameText, "text-base sm:text-lg")}>{track.current_stage}</span>
          {" · "}
          Applied {new Date(track.applied_at).toLocaleDateString("en-RW")}
        </p>
      </Card>

      <WalletUsagePanel wallet={wallet} variant="track" />

      <GarageHealthPanel
        garage={garage}
        evOfChoice={financing.target_vehicle_name}
      />

      <TrackVisualDashboard track={track} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Training
          </p>
          <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
            <DonutChart
              size={128}
              strokeWidth={12}
              centerLabel={`${trainingPct}%`}
              centerSub="ready"
              segments={[
                { value: Math.max(trainingPct, 1), color: "var(--volt)", label: "Ready" },
                {
                  value: Math.max(100 - trainingPct, 1),
                  color: "oklch(0.88 0.01 130)",
                  label: "Left",
                },
              ]}
            />
            <div className="min-w-0 flex-1 self-stretch">
              <p className="text-base text-muted-foreground">
                {TRAINING_LABELS[track.training.status] ?? track.training.status} · overall readiness
              </p>
              <div className="mt-6">
                <HistogramChart
                  height={220}
                  bars={[
                    {
                      label: "Attendance",
                      value: track.training.attendance_percentage ?? 0,
                      color: "var(--volt)",
                    },
                    {
                      label: "Exam",
                      value: track.training.exam_score ?? 0,
                      color: "var(--primary)",
                    },
                  ]}
                  valueFormatter={(n) => (n ? `${n}%` : "—")}
                />
              </div>
              <dl className="mt-5 divide-y divide-border/60 border-t border-border/60">
                <div className="flex items-baseline justify-between gap-4 py-3">
                  <dt className={cn(nameText, "text-base text-muted-foreground")}>Status</dt>
                  <dd className={valueMd}>
                    {TRAINING_LABELS[track.training.status] ?? track.training.status}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Financing
          </p>
          <div className="mt-3">
            <p
              className={cn(
                valueLg,
                depositPct != null && depositPct >= 100
                  ? "text-primary"
                  : depositPct != null && depositPct < 50
                    ? "text-destructive"
                    : "",
              )}
            >
              {depositPct != null ? depositPct : "—"}
              {depositPct != null && (
                <span className="text-2xl text-muted-foreground sm:text-3xl">%</span>
              )}
            </p>
            <p className="mt-2 text-base text-muted-foreground">
              of 10% deposit · bank pays price − contribution
            </p>
            {remainingToTen > 0 && (
              <p className="mt-3 font-display text-lg font-light tracking-tight text-destructive sm:text-xl">
                Left to pay for 10%: {formatRwf(remainingToTen, { compact: true })}
              </p>
            )}
          </div>
          <div className="mt-8">
            <HistogramChart
              height={280}
              bars={[
                {
                  label: "Vehicle",
                  value: vehiclePrice,
                  color: "oklch(0.35 0.04 158)",
                },
                {
                  label: "Offered",
                  value: depositReady,
                  color: "var(--primary)",
                },
                {
                  label: "To 10%",
                  value: remainingToTen,
                  color: "var(--destructive)",
                },
                {
                  label: "Bank",
                  value: bankFinance,
                  color: "var(--volt)",
                },
              ]}
              valueFormatter={(n) => formatRwf(n, { compact: true })}
            />
          </div>
          <dl className="mt-5 divide-y divide-border/60 border-t border-border/60">
            {financing.target_vehicle_name && (
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className={cn(nameText, "text-base text-muted-foreground")}>EV of choice</dt>
                <dd className={cn(nameText, "max-w-[60%] text-right text-base sm:text-lg")}>
                  {financing.target_vehicle_name}
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className={cn(nameText, "text-base text-muted-foreground")}>Vehicle price</dt>
              <dd className={valueMd}>
                {vehiclePrice ? formatRwf(vehiclePrice, { compact: true }) : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className={cn(nameText, "text-base text-muted-foreground")}>Deposit offered</dt>
              <dd className={valueMd}>{formatRwf(depositReady, { compact: true })}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className={cn(nameText, "text-base text-muted-foreground")}>Remaining to 10%</dt>
              <dd className={cn(valueMd, remainingToTen > 0 ? "text-destructive" : "text-primary")}>
                {formatRwf(remainingToTen, { compact: true })}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className={cn(nameText, "text-base text-muted-foreground")}>
                Bank pays (price − contribution)
              </dt>
              <dd className={valueMd}>
                {vehiclePrice > 0 ? formatRwf(bankFinance, { compact: true }) : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className={cn(nameText, "text-base text-muted-foreground")}>Term</dt>
              <dd className={valueMd}>
                {financing.preferred_term_years != null
                  ? `${financing.preferred_term_years} yrs`
                  : "—"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="border-border/70 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className={cn(nameText, "text-2xl sm:text-3xl")}>Bank documents</h3>
            <p
              className={cn(
                valueLg,
                "mt-3",
                track.documents_summary.percent >= 100
                  ? "text-primary"
                  : track.documents_summary.percent === 0
                    ? "text-destructive"
                    : "",
              )}
            >
              {track.documents_summary.percent}
              <span className="text-2xl text-muted-foreground sm:text-3xl">%</span>
            </p>
            <p className="mt-2 text-base text-muted-foreground">
              {track.documents_summary.complete}/{track.documents_summary.required} required
            </p>
          </div>
          <DonutChart
            size={120}
            strokeWidth={12}
            centerLabel={`${track.documents_summary.percent}%`}
            centerSub="file"
            segments={[
              { value: docsProvided.length || 0.001, color: "var(--primary)", label: "Provided" },
              { value: docsMissing.length || 0.001, color: "var(--destructive)", label: "Missing" },
              { value: docsOptional.length || 0.001, color: "oklch(0.75 0.02 130)", label: "Optional" },
            ]}
          />
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "On file",
              count: docsProvided.length,
              color: "bg-primary",
              text: "text-primary",
              pct:
                track.documents.length > 0
                  ? Math.round((docsProvided.length / track.documents.length) * 100)
                  : 0,
            },
            {
              label: "Still needed",
              count: docsMissing.length,
              color: "bg-destructive",
              text: "text-destructive",
              pct:
                track.documents.length > 0
                  ? Math.round((docsMissing.length / track.documents.length) * 100)
                  : 0,
            },
            {
              label: "Optional",
              count: docsOptional.length,
              color: "bg-foreground/30",
              text: "text-muted-foreground",
              pct:
                track.documents.length > 0
                  ? Math.round((docsOptional.length / track.documents.length) * 100)
                  : 0,
            },
          ].map((row) => (
            <div key={row.label} className="rounded-xl border border-border/50 bg-muted/20 px-4 py-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className={cn(nameText, "text-base text-muted-foreground")}>{row.label}</p>
                <p className={cn(valueMd, row.text)}>{row.count}</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", row.color)}
                  style={{ width: `${Math.min(100, row.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {track.documents.map((d) => {
            const tone = d.complete
              ? "border-primary/30 bg-primary/10 text-primary"
              : d.required
                ? "border-destructive/25 bg-destructive/5 text-destructive"
                : "border-border/60 bg-muted/40 text-muted-foreground";
            return (
              <span
                key={d.key}
                className={cn(
                  "inline-flex max-w-full items-center rounded-lg border px-2.5 py-1.5 font-display text-xs font-light tracking-tight sm:text-sm",
                  tone,
                )}
                title={d.label}
              >
                <span className="truncate">{d.label}</span>
              </span>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

type SearchProps = {
  variant?: "hero" | "section" | "page";
  onResult?: (track: CandidateTrackView) => void;
  onSubmitCode?: (code: string) => void;
  defaultCode?: string;
  /** When true (e.g. after a bank ID lookup), show a second candidate-ID field */
  showCandidateField?: boolean;
  candidateCode?: string;
  onCandidateCodeChange?: (code: string) => void;
  onCandidateSubmit?: (code: string) => void;
};

export function CandidateTrackSearch({
  variant = "section",
  onResult,
  onSubmitCode,
  defaultCode = "",
  showCandidateField = false,
  candidateCode = "",
  onCandidateCodeChange,
  onCandidateSubmit,
}: SearchProps) {
  const [code, setCode] = useState(defaultCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const candidateInputRef = useRef<HTMLInputElement>(null);

  const isHero = variant === "hero";
  const isPage = variant === "page";
  const onDark = isHero || isPage;

  useEffect(() => {
    if (defaultCode) setCode(defaultCode);
  }, [defaultCode]);

  useEffect(() => {
    if (showCandidateField) {
      const t = window.setTimeout(() => candidateInputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [showCandidateField]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a candidate ID or bank ID.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (onSubmitCode) {
        onSubmitCode(trimmed);
        return;
      }
      const result = await trackLookup(trimmed);
      if (result.type === "bank") {
        window.location.assign(`/track?id=${encodeURIComponent(trimmed)}`);
        return;
      }
      onResult?.(result.track);
    } catch (err) {
      setError(friendlyTrackError(err));
    } finally {
      setBusy(false);
    }
  }

  function handleCandidateSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = candidateCode.trim().toUpperCase();
    if (!trimmed) return;
    onCandidateSubmit?.(trimmed);
  }

  const fieldShell = cn(
    "flex items-center gap-1.5 rounded-xl border p-1.5 shadow-none",
    onDark
      ? "border-white/25 bg-white/10 focus-within:border-volt/60"
      : "border-input bg-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
  );

  return (
    <div
      className={cn(
        "w-full",
        isHero &&
          "rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm sm:p-4",
        isPage && "max-w-2xl",
      )}
    >
      <p
        className={cn(
          "font-display font-semibold leading-snug tracking-tight",
          isHero && "text-[0.95rem] text-ink-foreground sm:text-base",
          isPage && "text-[1.75rem] text-ink-foreground sm:text-4xl md:text-[2.75rem]",
          !onDark && "text-[1.65rem] sm:text-3xl md:text-4xl",
        )}
      >
        Look up a candidate or bank ID.
      </p>
      {isHero && (
        <p className="mt-1.5 text-[11px] leading-snug text-ink-foreground/65 sm:text-xs">
          Candidate or bank ID · training, docs, financing.
        </p>
      )}

      <form
        onSubmit={handleSearch}
        className={cn(isHero && "mt-3.5", isPage && "mt-8 max-w-xl", !onDark && "mt-8 max-w-xl")}
      >
        <label
          className={cn(
            "mb-1.5 block text-xs font-medium",
            onDark ? "text-ink-foreground/55" : "text-muted-foreground",
          )}
        >
          Bank or candidate ID
        </label>
        <div className={fieldShell}>
          <div className="relative min-w-0 flex-1">
            <FiSearch
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4",
                onDark ? "text-ink-foreground/50" : "text-muted-foreground",
              )}
              aria-hidden
            />
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="UZA-BANK-2026-00001"
              className={cn(
                "h-10 w-full border-0 bg-transparent pl-10 font-display tracking-wide shadow-none focus-visible:ring-0",
                isPage && "h-11 text-base",
                onDark
                  ? "text-ink-foreground placeholder:text-ink-foreground/40"
                  : "placeholder:text-muted-foreground",
              )}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button
            type="submit"
            size="sm"
            className={cn(
              "h-10 shrink-0 px-5 shadow-none",
              isPage && "h-11 px-6 text-base",
              onDark ? "bg-volt text-volt-foreground hover:bg-volt/90" : "",
            )}
            disabled={busy}
          >
            {busy ? "…" : "Search"}
          </Button>
        </div>
      </form>

      {showCandidateField && (
        <form
          onSubmit={handleCandidateSearch}
          className={cn("mt-3 max-w-xl animate-in fade-in slide-in-from-top-1 duration-200")}
        >
          <label
            className={cn(
              "mb-1.5 block text-xs font-medium",
              onDark ? "text-volt" : "text-primary",
            )}
          >
            Search candidate ID in this bank
          </label>
          <div className={fieldShell}>
            <div className="relative min-w-0 flex-1">
              <FiSearch
                className={cn(
                  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4",
                  onDark ? "text-ink-foreground/50" : "text-muted-foreground",
                )}
                aria-hidden
              />
              <Input
                ref={candidateInputRef}
                value={candidateCode}
                onChange={(e) => onCandidateCodeChange?.(e.target.value.toUpperCase())}
                placeholder="UZA-2026-00001"
                className={cn(
                  "h-10 w-full border-0 bg-transparent pl-10 font-display tracking-wide shadow-none focus-visible:ring-0",
                  isPage && "h-11 text-base",
                  onDark
                    ? "text-ink-foreground placeholder:text-ink-foreground/40"
                    : "placeholder:text-muted-foreground",
                )}
                autoComplete="off"
                spellCheck={false}
                aria-label="Search candidate ID within bank portfolio"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className={cn(
                "h-10 shrink-0 px-5 shadow-none",
                isPage && "h-11 px-6 text-base",
                onDark
                  ? "border-white/30 bg-white/10 text-ink-foreground hover:bg-white/15"
                  : "",
              )}
            >
              Find
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p
          className={cn(
            "mt-3 text-sm leading-snug",
            onDark
              ? "text-red-200"
              : "rounded-lg border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-destructive",
            isHero && "rounded-lg border border-red-300/40 bg-red-950/30 px-2.5 py-2 text-[11px] sm:text-xs",
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** @deprecated Use CandidateTrackSearch + CandidateTrackResult */
export function CandidateTracker() {
  const [track, setTrack] = useState<CandidateTrackView | null>(null);
  return (
    <div>
      <CandidateTrackSearch onResult={setTrack} />
      {track && (
        <div className="mt-8">
          <CandidateTrackResult track={track} />
        </div>
      )}
    </div>
  );
}
