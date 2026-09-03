import { useEffect, useRef, useState } from "react";
import { FiCheck, FiAlertCircle, FiClock, FiSearch } from "react-icons/fi";
import {
  trackLookup,
  type CandidateTrackView,
  type TrackMilestoneStatus,
} from "@/services/candidateService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrackVisualDashboard } from "@/components/home/TrackVisuals";
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

function milestoneIcon(status: TrackMilestoneStatus) {
  if (status === "complete") return FiCheck;
  if (status === "action_required" || status === "blocked") return FiAlertCircle;
  return FiClock;
}

function milestoneTone(status: TrackMilestoneStatus) {
  if (status === "complete") return "bg-primary/10 text-primary border-primary/20";
  if (status === "in_progress" || status === "in_review")
    return "bg-volt/15 text-foreground border-volt/30";
  if (status === "action_required" || status === "blocked")
    return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-muted text-muted-foreground border-border";
}

export function CandidateTrackResult({ track }: { track: CandidateTrackView }) {
  return (
    <div className="space-y-8">
      <Card className="border-border/70 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Your application
            </p>
            <h3 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {track.full_name}
            </h3>
            <p className="mt-2 font-display text-base font-semibold text-primary sm:text-lg">
              {track.candidate_code}
            </p>
          </div>
          <Badge
            variant={
              track.status === "enrolled" || track.status === "graduated" ? "default" : "secondary"
            }
            className="px-3 py-1 text-sm"
          >
            {STATUS_LABELS[track.status] ?? track.status}
            {track.waitlist_position ? ` · #${track.waitlist_position}` : ""}
          </Badge>
        </div>

        {track.cohort && (
          <dl className="mt-6 grid gap-4 text-base sm:grid-cols-2 lg:grid-cols-4 sm:text-lg">
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Cohort
              </dt>
              <dd className="mt-1.5 font-semibold">{track.cohort.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Start
              </dt>
              <dd className="mt-1.5 font-semibold">
                {track.cohort.start_date ?? "To be confirmed"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Location
              </dt>
              <dd className="mt-1.5 font-semibold">{track.cohort.location ?? "TBC"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Partner bank
              </dt>
              <dd className="mt-1.5 font-semibold">
                {track.cohort.partner_bank ?? "Assigned after review"}
              </dd>
            </div>
          </dl>
        )}

        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          Current stage: <span className="font-semibold text-foreground">{track.current_stage}</span>
          {" · "}
          Applied {new Date(track.applied_at).toLocaleDateString("en-RW")}
        </p>
      </Card>

      <TrackVisualDashboard track={track} />

      <Card className="border-border/70 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Programme progress
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-display text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl">
              {track.milestones.filter((m) => m.status === "complete").length}
              <span className="text-2xl font-semibold text-muted-foreground sm:text-3xl">
                /{track.milestones.length}
              </span>
            </p>
            <p className="mt-2 text-base text-muted-foreground">
              Current stage:{" "}
              <span className="font-semibold text-foreground">{track.current_stage}</span>
            </p>
          </div>
        </div>
        <ol className="mt-6 divide-y divide-border/60 border-t border-border/60">
          {track.milestones.map((m, i) => {
            const Icon = milestoneIcon(m.status);
            return (
              <li key={m.id} className="flex items-center gap-4 py-3.5">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-base",
                    milestoneTone(m.status),
                  )}
                >
                  <Icon aria-hidden size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold sm:text-lg">{m.label}</p>
                  <p className="mt-0.5 text-sm capitalize text-muted-foreground sm:text-base">
                    {m.status.replace(/_/g, " ")}
                  </p>
                </div>
                <span className="font-display text-2xl font-bold tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Training
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-display text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl">
                {track.training.status === "completed"
                  ? "100"
                  : track.training.status === "not_started"
                    ? "0"
                    : String(track.training.attendance_percentage ?? 0)}
                <span className="text-2xl font-semibold text-muted-foreground sm:text-3xl">%</span>
              </p>
              <p className="mt-2 text-base text-muted-foreground">
                {TRAINING_LABELS[track.training.status] ?? track.training.status} · overall readiness
              </p>
            </div>
          </div>
          <Progress
            value={
              track.training.status === "completed"
                ? 100
                : track.training.status === "not_started"
                  ? 0
                  : track.training.attendance_percentage ?? 15
            }
            className="mt-5 h-3.5 [&>div]:bg-volt"
          />
          <dl className="mt-5 divide-y divide-border/60 border-t border-border/60">
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-base text-muted-foreground">Status</dt>
              <dd className="font-display text-xl font-bold sm:text-2xl">
                {TRAINING_LABELS[track.training.status] ?? track.training.status}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-base text-muted-foreground">Attendance</dt>
              <dd className="font-display text-xl font-bold tabular-nums sm:text-2xl">
                {track.training.attendance_percentage != null
                  ? `${track.training.attendance_percentage}%`
                  : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-base text-muted-foreground">Exam score</dt>
              <dd className="font-display text-xl font-bold tabular-nums sm:text-2xl">
                {track.training.exam_score != null ? `${track.training.exam_score}%` : "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="border-border/70 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Financing
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              {(() => {
                const required = track.financing.deposit_required_rwf;
                const ready = track.financing.deposit_available_rwf;
                const pct =
                  required && ready != null
                    ? Math.min(100, Math.round((ready / required) * 100))
                    : null;
                return (
                  <>
                    <p
                      className={cn(
                        "font-display text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl",
                        pct != null && pct >= 100 ? "text-primary" : pct != null && pct < 50 ? "text-destructive" : "",
                      )}
                    >
                      {pct != null ? pct : "—"}
                      {pct != null && (
                        <span className="text-2xl font-semibold text-muted-foreground sm:text-3xl">
                          %
                        </span>
                      )}
                    </p>
                    <p className="mt-2 text-base text-muted-foreground">
                      deposit vs required · {track.financing.preferred_financing ?? "—"}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
          {track.financing.deposit_required_rwf != null &&
            track.financing.deposit_available_rwf != null && (
              <Progress
                value={Math.min(
                  100,
                  (track.financing.deposit_available_rwf / track.financing.deposit_required_rwf) *
                    100,
                )}
                className="mt-5 h-3.5"
              />
            )}
          <dl className="mt-5 divide-y divide-border/60 border-t border-border/60">
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-base text-muted-foreground">Term</dt>
              <dd className="font-display text-xl font-bold sm:text-2xl">
                {track.financing.preferred_term_years != null
                  ? `${track.financing.preferred_term_years} yrs`
                  : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-base text-muted-foreground">Target vehicle</dt>
              <dd className="font-display text-xl font-bold tabular-nums sm:text-2xl">
                {track.financing.target_vehicle_price_rwf
                  ? formatRwf(track.financing.target_vehicle_price_rwf, { compact: true })
                  : "—"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-base text-muted-foreground">Deposit ready</dt>
              <dd className="font-display text-xl font-bold tabular-nums text-primary sm:text-2xl">
                {track.financing.deposit_available_rwf != null
                  ? formatRwf(track.financing.deposit_available_rwf, { compact: true })
                  : "—"}
              </dd>
            </div>
            {track.financing.deposit_required_rwf != null && (
              <div className="flex items-baseline justify-between gap-4 py-3">
                <dt className="text-base text-muted-foreground">Deposit required</dt>
                <dd className="font-display text-xl font-bold tabular-nums sm:text-2xl">
                  {formatRwf(track.financing.deposit_required_rwf, { compact: true })}
                  {track.financing.deposit_required_percent != null && (
                    <span className="ml-1 text-base font-semibold text-muted-foreground">
                      ({Math.round(track.financing.deposit_required_percent * 100)}%)
                    </span>
                  )}
                </dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-base text-muted-foreground">UZA Access top-up</dt>
              <dd
                className={cn(
                  "font-display text-xl font-bold sm:text-2xl",
                  track.financing.needs_uza_access_support && "text-foreground",
                )}
              >
                {track.financing.needs_uza_access_support ? "Requested" : "No"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="border-border/70 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Bank documents
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className={cn(
                "font-display text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-5xl",
                track.documents_summary.percent >= 100
                  ? "text-primary"
                  : track.documents_summary.percent === 0
                    ? "text-destructive"
                    : "",
              )}
            >
              {track.documents_summary.percent}
              <span className="text-2xl font-semibold text-muted-foreground sm:text-3xl">%</span>
            </p>
            <p className="mt-2 text-base text-muted-foreground">
              {track.documents_summary.complete} of {track.documents_summary.required} required on
              file
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              {
                label: "Received",
                count: track.documents.filter((d) => d.complete).length,
                color: "text-primary",
              },
              {
                label: "Needed",
                count: track.documents.filter((d) => !d.complete && d.required).length,
                color: "text-destructive",
              },
              {
                label: "Optional",
                count: track.documents.filter((d) => !d.complete && !d.required).length,
                color: "",
              },
            ].map((bucket) => (
              <div key={bucket.label}>
                <p className={cn("font-display text-3xl font-bold tabular-nums", bucket.color)}>
                  {bucket.count}
                </p>
                <p className="text-xs text-muted-foreground sm:text-sm">{bucket.label}</p>
              </div>
            ))}
          </div>
        </div>
        <Progress value={track.documents_summary.percent} className="mt-5 h-3.5" />
        <ul className="mt-6 divide-y divide-border/60 border-t border-border/60">
          {track.documents.map((doc) => (
            <li
              key={doc.key}
              className="flex items-center justify-between gap-4 py-3.5 text-base sm:text-lg"
            >
              <span
                className={cn(
                  "min-w-0",
                  doc.complete ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {doc.label}
                {doc.optional_later && (
                  <span className="ml-1.5 text-sm text-muted-foreground">(can come later)</span>
                )}
              </span>
              <Badge
                variant={doc.complete ? "default" : "secondary"}
                className={cn(
                  "shrink-0 px-2.5 py-1 text-sm font-semibold",
                  !doc.complete && doc.required && "bg-destructive/10 text-destructive hover:bg-destructive/10",
                )}
              >
                {doc.complete ? "Received" : doc.required ? "Needed" : "Optional"}
              </Badge>
            </li>
          ))}
        </ul>
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
