import { useEffect, useState } from "react";
import { FiCheck, FiAlertCircle, FiClock, FiSearch } from "react-icons/fi";
import {
  trackCandidate,
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
    <div className="space-y-6">
      <Card className="border-border/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-eyebrow text-muted-foreground">Your application</p>
            <h3 className="mt-1 font-display text-2xl font-bold tracking-tight">{track.full_name}</h3>
            <p className="mt-1 font-display text-sm font-semibold text-primary">{track.candidate_code}</p>
          </div>
          <Badge variant={track.status === "enrolled" || track.status === "graduated" ? "default" : "secondary"}>
            {STATUS_LABELS[track.status] ?? track.status}
            {track.waitlist_position ? ` · #${track.waitlist_position}` : ""}
          </Badge>
        </div>

        {track.cohort && (
          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-eyebrow text-muted-foreground">Cohort</dt>
              <dd className="mt-1 font-medium">{track.cohort.name}</dd>
            </div>
            <div>
              <dt className="text-eyebrow text-muted-foreground">Start</dt>
              <dd className="mt-1 font-medium">{track.cohort.start_date ?? "To be confirmed"}</dd>
            </div>
            <div>
              <dt className="text-eyebrow text-muted-foreground">Location</dt>
              <dd className="mt-1 font-medium">{track.cohort.location ?? "TBC"}</dd>
            </div>
            <div>
              <dt className="text-eyebrow text-muted-foreground">Partner bank</dt>
              <dd className="mt-1 font-medium">{track.cohort.partner_bank ?? "Assigned after review"}</dd>
            </div>
          </dl>
        )}

        <p className="mt-4 text-sm text-muted-foreground">
          Current stage: <span className="font-medium text-foreground">{track.current_stage}</span>
          {" · "}
          Applied {new Date(track.applied_at).toLocaleDateString("en-RW")}
        </p>
      </Card>

      <TrackVisualDashboard track={track} />

      <Card className="border-border/70 p-5 sm:p-6">
        <p className="text-eyebrow text-muted-foreground">Programme progress</p>
        <ol className="mt-4 space-y-3">
          {track.milestones.map((m, i) => {
            const Icon = milestoneIcon(m.status);
            return (
              <li key={m.id} className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm",
                    milestoneTone(m.status),
                  )}
                >
                  <Icon aria-hidden size={14} />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs capitalize text-muted-foreground">{m.status.replace(/_/g, " ")}</p>
                </div>
                <span className="text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 p-5 sm:p-6">
          <p className="text-eyebrow text-muted-foreground">Training</p>
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-muted-foreground">Overall readiness</span>
                <span className="font-medium">
                  {track.training.status === "not_started"
                    ? "Not started"
                    : track.training.status === "completed"
                      ? "Completed"
                      : `${track.training.attendance_percentage ?? 0}% attendance`}
                </span>
              </div>
              <Progress
                value={
                  track.training.status === "completed"
                    ? 100
                    : track.training.status === "not_started"
                      ? 0
                      : track.training.attendance_percentage ?? 15
                }
                className="h-2.5 [&>div]:bg-volt"
              />
            </div>
            {track.training.exam_score != null && (
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Exam score</span>
                  <span className="font-medium">{track.training.exam_score}%</span>
                </div>
                <Progress value={track.training.exam_score} className="h-2.5" />
              </div>
            )}
          </div>
          <dl className="mt-4 space-y-3 border-t border-border/60 pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">{TRAINING_LABELS[track.training.status] ?? track.training.status}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Attendance</dt>
              <dd className="font-medium">
                {track.training.attendance_percentage != null
                  ? `${track.training.attendance_percentage}%`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Exam score</dt>
              <dd className="font-medium">
                {track.training.exam_score != null ? `${track.training.exam_score}%` : "—"}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="border-border/70 p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <p className="text-eyebrow text-muted-foreground">Financing</p>
            <span className="text-sm font-medium">{track.financing.preferred_financing ?? "—"}</span>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            {track.financing.deposit_required_rwf != null && track.financing.deposit_available_rwf != null && (
              <div>
                <div className="mb-1.5 flex justify-between text-xs">
                  <span className="text-muted-foreground">Deposit vs required</span>
                  <span className="font-medium">
                    {Math.min(
                      100,
                      Math.round(
                        (track.financing.deposit_available_rwf / track.financing.deposit_required_rwf) *
                          100,
                      ),
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    100,
                    (track.financing.deposit_available_rwf / track.financing.deposit_required_rwf) * 100,
                  )}
                  className="h-2.5"
                />
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Term</dt>
              <dd className="font-medium">
                {track.financing.preferred_term_years != null
                  ? `${track.financing.preferred_term_years} years`
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Target vehicle</dt>
              <dd className="font-medium">
                {track.financing.target_vehicle_price_rwf
                  ? formatRwf(track.financing.target_vehicle_price_rwf)
                  : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Deposit ready</dt>
              <dd className="font-medium">
                {track.financing.deposit_available_rwf != null
                  ? formatRwf(track.financing.deposit_available_rwf)
                  : "—"}
              </dd>
            </div>
            {track.financing.deposit_required_rwf != null && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Deposit required</dt>
                <dd className="font-medium">
                  {formatRwf(track.financing.deposit_required_rwf)}
                  {track.financing.deposit_required_percent != null &&
                    ` (${Math.round(track.financing.deposit_required_percent * 100)}%)`}
                </dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">UZA Access top-up</dt>
              <dd className="font-medium">
                {track.financing.needs_uza_access_support ? "Requested" : "Not requested"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="border-border/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-eyebrow text-muted-foreground">Bank documents</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {track.documents_summary.complete} of {track.documents_summary.required} required items on file
            </p>
          </div>
          <span className="font-display text-2xl font-bold">{track.documents_summary.percent}%</span>
        </div>
        <Progress value={track.documents_summary.percent} className="mt-4 h-3" />
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            {
              label: "Received",
              count: track.documents.filter((d) => d.complete).length,
              className: "bg-primary",
            },
            {
              label: "Needed",
              count: track.documents.filter((d) => !d.complete && d.required).length,
              className: "bg-destructive",
            },
            {
              label: "Optional",
              count: track.documents.filter((d) => !d.complete && !d.required).length,
              className: "bg-muted-foreground/40",
            },
          ].map((bucket) => (
            <div key={bucket.label} className="rounded-lg border border-border/60 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{bucket.label}</span>
                <span className="font-display text-lg font-bold">{bucket.count}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", bucket.className)}
                  style={{
                    width: `${track.documents.length ? (bucket.count / track.documents.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <ul className="mt-5 divide-y divide-border/60">
          {track.documents.map((doc) => (
            <li key={doc.key} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className={doc.complete ? "text-foreground" : "text-muted-foreground"}>
                {doc.label}
                {doc.optional_later && (
                  <span className="ml-1 text-xs text-muted-foreground">(can come later)</span>
                )}
              </span>
              <Badge variant={doc.complete ? "default" : "secondary"}>
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
};

export function CandidateTrackSearch({
  variant = "section",
  onResult,
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
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter your candidate ID.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (onSubmitCode) {
        onSubmitCode(trimmed);
        return;
      }
      const result = await trackCandidate(trimmed);
      onResult?.(result);
    } catch (err) {
      setError(friendlyTrackError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "w-full",
        isHero &&
          "rounded-2xl border border-white/15 bg-white/[0.07] p-4 backdrop-blur-sm sm:p-4",
        isPage && "max-w-2xl",
      )}
    >
      <p className={cn("text-eyebrow", onDark ? "text-volt" : "text-muted-foreground")}>
        Track your application
      </p>
      <p
        className={cn(
          "mt-1 font-display font-semibold leading-snug tracking-tight",
          isHero && "text-[0.95rem] text-ink-foreground sm:text-base",
          isPage && "text-[1.75rem] text-ink-foreground sm:text-4xl md:text-[2.75rem]",
          !onDark && "text-[1.65rem] sm:text-3xl md:text-4xl",
        )}
      >
        Look up your candidate ID.
      </p>
      {(isPage || !isHero) && (
        <p
          className={cn(
            "mt-3 max-w-xl leading-relaxed",
            isPage && "text-sm text-ink-foreground/70 sm:text-base",
            !onDark && "text-sm text-muted-foreground sm:text-base",
          )}
        >
          Enter the ID from your application to see cohort, training, documents, financing, and
          pending approvals.
        </p>
      )}
      {isHero && (
        <p className="mt-1.5 text-[11px] leading-snug text-ink-foreground/65 sm:text-xs">
          Cohort, training, docs, financing & approvals.
        </p>
      )}

      <form
        onSubmit={handleSearch}
        className={cn(
          "flex flex-col gap-2.5",
          isHero && "mt-3.5",
          isPage && "mt-8 max-w-lg sm:flex-row sm:items-stretch sm:gap-3",
          !onDark && "mt-8 max-w-xl sm:flex-row sm:items-center sm:gap-2.5",
        )}
      >
        <div className="relative min-w-0 w-full flex-1">
          <FiSearch
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2",
              isHero ? "size-3.5" : "size-4",
              onDark ? "text-ink-foreground/50" : "text-muted-foreground",
            )}
            aria-hidden
          />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="UZA-2026-00001"
            className={cn(
              "w-full font-display tracking-wide shadow-none",
              isHero && "h-10 pl-9 text-sm",
              isPage && "h-12 border-white/25 bg-white/10 pl-11 text-base text-ink-foreground placeholder:text-ink-foreground/40",
              !onDark && "h-11 pl-10 text-sm",
              isHero && "border-white/20 bg-white/10 text-ink-foreground placeholder:text-ink-foreground/40",
            )}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button
          type="submit"
          size={isHero ? "sm" : "lg"}
          className={cn(
            "shadow-none",
            isHero && "h-10 w-full bg-volt text-volt-foreground hover:bg-volt/90",
            isPage && "h-12 w-full bg-volt px-8 text-volt-foreground hover:bg-volt/90 sm:w-auto sm:shrink-0",
            !onDark && "h-10 w-full sm:w-auto sm:shrink-0",
          )}
          disabled={busy}
        >
          {busy ? "Searching…" : "View my status"}
        </Button>
      </form>

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
