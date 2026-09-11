import { useEffect, useState } from "react";
import { FiDownload, FiSearch } from "react-icons/fi";
import {
  trackLookup,
  type CandidateTrackView,
} from "@/services/candidateService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CandidateDossierCard } from "@/components/home/CandidateDossierCard";
import { resolveTrackGarage, resolveTrackWallet, resolveTrackFinancing } from "@/components/home/trackFallbacks";
import { DonutChart, HistogramChart } from "@/components/charts/ChartPrimitives";
import { formatRwf } from "@/utils/financing";
import { downloadTrackReportPdf } from "@/utils/downloadTrackReport";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
    "font-display text-4xl font-semibold leading-none tracking-tight tabular-nums sm:text-5xl";
  const valueMd = "font-display text-xl font-medium tracking-tight tabular-nums sm:text-2xl";
  const nameText = "font-display font-medium tracking-tight text-foreground";

  const isCertified =
    track.training.status === "completed" || track.status === "graduated";

  return (
    <CandidateDossierCard
      track={track}
      wallet={wallet}
      garage={garage}
      evOfChoice={financing.target_vehicle_name}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="default"
            className="h-11 gap-2 border-0 bg-emerald-600 px-5 text-base font-display font-semibold text-white shadow-none hover:bg-emerald-700"
              onClick={async () => {
                try {
                  await downloadTrackReportPdf(track);
                  toast.success("Track report downloaded");
                } catch {
                  toast.error("Could not create the PDF");
                }
              }}
          >
            <FiDownload size={18} aria-hidden />
            Download PDF
          </Button>
          <Badge
            variant={isCertified ? "default" : "secondary"}
            className={cn(
              "h-11 items-center rounded-md px-5 text-base font-semibold",
              isCertified
                ? "bg-primary text-primary-foreground"
                : "border-2 border-amber-400/70 bg-amber-100 text-amber-800",
            )}
          >
            {isCertified ? "Certified" : "Not certified"}
          </Badge>
        </div>
      }
    >
      <div className="border-t border-border/40 p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="py-2">
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
          </div>

          <div className="py-2">
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
          </div>
        </div>

        <div className="mt-6 py-2">
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
              <div key={row.label} className="px-0 py-2">
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
                    "inline-flex max-w-full items-center border px-2.5 py-1.5 font-display text-xs font-medium tracking-tight sm:text-sm",
                    tone,
                  )}
                  title={d.label}
                >
                  <span className="truncate">{d.label}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </CandidateDossierCard>
  );
}

type SearchProps = {
  variant?: "hero" | "section" | "page";
  onResult?: (track: CandidateTrackView) => void;
  onSubmitLookup?: (payload: { code: string }) => void;
  /** @deprecated Prefer onSubmitLookup */
  onSubmitCode?: (code: string) => void;
  defaultCode?: string;
};

export function CandidateTrackSearch({
  variant = "section",
  onResult,
  onSubmitLookup,
  onSubmitCode,
  defaultCode = "",
}: SearchProps) {
  const [code, setCode] = useState(defaultCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isHero = variant === "hero";
  const isPage = variant === "page";
  const onDark = isHero || isPage;

  useEffect(() => {
    if (defaultCode) setCode(defaultCode);
  }, [defaultCode]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Enter a candidate ID or bank ID.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (onSubmitLookup) {
        onSubmitLookup({ code: trimmed });
        return;
      }
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
        isPage && "mx-auto max-w-2xl text-center",
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
      <p
        className={cn(
          "mt-2 text-sm",
          isPage && "mx-auto max-w-lg",
          onDark ? "text-ink-foreground/65" : "text-muted-foreground",
        )}
      >
        Enter your candidate ID to open your application record.
      </p>

      <form
        onSubmit={handleSearch}
        className={cn(
          isHero && "mt-3.5",
          isPage && "mx-auto mt-8 w-full max-w-xl",
          !onDark && !isPage && "mt-8 max-w-xl",
        )}
      >
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
              placeholder="UZA-2026-00001 or UZA-BANK-…"
              aria-label="Bank or candidate ID"
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

      {error && (
        <p
          className={cn(
            "mt-3 text-sm leading-snug",
            isPage && "mx-auto max-w-xl",
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
