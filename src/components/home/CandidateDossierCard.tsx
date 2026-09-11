import { useState, type ReactNode } from "react";
import { FiCheck, FiCopy, FiFileText } from "react-icons/fi";
import { toast } from "sonner";
import type { CandidateTrackView } from "@/services/candidateService";
import {
  WalletUsagePanel,
  type WalletPreview,
} from "@/components/home/WalletUsagePanel";
import {
  GarageHealthPanel,
  type GaragePreview,
} from "@/components/home/GarageHealthPanel";
import { TrackVisualDashboard } from "@/components/home/TrackVisuals";
import { cn } from "@/lib/utils";
import { formatRwf } from "@/utils/financing";

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

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB");
  } catch {
    return iso;
  }
}

/** Dossier-style candidate profile: left identity, right summary + status. */
export function CandidateDossierCard({
  track,
  actions,
  wallet,
  garage,
  evOfChoice,
  children,
}: {
  track: CandidateTrackView;
  actions?: ReactNode;
  wallet?: WalletPreview;
  garage?: GaragePreview;
  evOfChoice?: string | null;
  children?: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const statusLabel = STATUS_LABELS[track.status] ?? track.status;
  const trainingLabel = TRAINING_LABELS[track.training.status] ?? track.training.status;
  const score =
    track.training.exam_score != null ? `${track.training.exam_score}/100` : "—";
  const passed =
    track.training.status === "completed" || track.status === "graduated";
  const statusTone = passed
    ? "bg-emerald-600 text-white"
    : track.status === "rejected" || track.training.status === "failed"
      ? "bg-destructive text-destructive-foreground"
      : "bg-primary text-primary-foreground";

  const rows: Array<{ label: string; value: string }> = [
    { label: "Candidate ID", value: track.candidate_code },
    { label: "Full name", value: track.full_name },
    { label: "Phone", value: track.phone || "—" },
    { label: "District", value: track.district || "—" },
    {
      label: "Cohort",
      value: track.cohort
        ? `${track.cohort.name}${track.cohort.code ? ` (${track.cohort.code})` : ""}`
        : "—",
    },
    { label: "Location", value: track.cohort?.location || "—" },
    { label: "Partner bank", value: track.cohort?.partner_bank || "—" },
    { label: "Training", value: trainingLabel },
    { label: "Exam score", value: score },
    { label: "Applied", value: formatDate(track.applied_at) },
    { label: "Current stage", value: track.current_stage || "—" },
    {
      label: "Vehicle",
      value: track.financing.target_vehicle_name
        ? `${track.financing.target_vehicle_name}${
            track.financing.target_vehicle_price_rwf
              ? ` · ${formatRwf(track.financing.target_vehicle_price_rwf)}`
              : ""
          }`
        : "—",
    },
  ];

  const currentMilestone =
    track.milestones.find((m) => m.status === "current" || m.status === "in_progress") ??
    track.milestones.find((m) => m.status === "pending") ??
    track.milestones[track.milestones.length - 1];

  async function copyCandidateId() {
    try {
      await navigator.clipboard.writeText(track.candidate_code);
      setCopied(true);
      toast.success("Candidate ID copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div className="overflow-hidden border-2 border-primary/50 bg-background shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary/25 px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-3 text-primary">
          <div className="flex items-center gap-2.5">
            <FiFileText className="size-6 shrink-0" strokeWidth={1.75} aria-hidden />
            <h2 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
              Candidate profile
            </h2>
          </div>
          <span
            className={cn(
              "inline-flex h-11 items-center rounded-full px-5 text-base font-semibold",
              statusTone,
            )}
          >
            {statusLabel}
          </span>
        </div>
        {actions}
      </div>

      <div className="grid lg:grid-cols-2">
        <div className="p-5 sm:p-6">
          <h3 className="font-display text-base font-semibold text-primary sm:text-lg">
            Application details
          </h3>

          <p className="mt-4 text-sm font-medium text-muted-foreground">Candidate ID</p>
          <div className="mt-1.5 flex items-center gap-2 bg-transparent px-0 py-2">
            <span className="min-w-0 flex-1 font-mono text-base font-semibold tracking-wide text-foreground sm:text-lg">
              {track.candidate_code}
            </span>
            <button
              type="button"
              onClick={copyCandidateId}
              className="inline-flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
              aria-label="Copy candidate ID"
              title="Copy candidate ID"
            >
              {copied ? (
                <FiCheck className="size-5 text-emerald-600" strokeWidth={2.5} aria-hidden />
              ) : (
                <FiCopy className="size-5" strokeWidth={2} aria-hidden />
              )}
            </button>
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <FiCheck className="size-4" strokeWidth={2.5} aria-hidden />
            </span>
          </div>

          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Your UZA record follows this ID from training to delivery. Current programme step:
          </p>

          <ul className="mt-3 space-y-2.5">
            {track.milestones.slice(0, 5).map((m) => {
              const completed = m.status === "complete" || m.status === "completed";
              const active =
                !completed &&
                (m.id === currentMilestone?.id ||
                  m.status === "current" ||
                  m.status === "in_progress");
              return (
                <li
                  key={m.id}
                  className={cn(
                    "flex items-center gap-3 py-2 text-base transition-colors",
                    completed
                      ? "text-foreground"
                      : active
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      completed
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : active
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/40 bg-transparent",
                    )}
                    aria-hidden
                  >
                    {completed ? (
                      <FiCheck className="size-3" strokeWidth={3} />
                    ) : active ? (
                      <span className="size-1.5 rounded-full bg-primary-foreground" />
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      (completed || active) && "text-foreground",
                    )}
                  >
                    {m.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="font-display text-base font-semibold text-primary sm:text-lg">
            Application summary
          </h3>

          <dl className="mt-4 space-y-3">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-0.5 text-base sm:grid-cols-[11.5rem_1fr] sm:gap-3"
              >
                <dt className="font-semibold text-primary/90">{row.label}:</dt>
                <dd className="min-w-0 break-words text-foreground/90">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {wallet ? <WalletUsagePanel wallet={wallet} variant="track" embedded /> : null}
      {garage ? (
        <GarageHealthPanel garage={garage} evOfChoice={evOfChoice} embedded />
      ) : null}
      <TrackVisualDashboard track={track} embedded />
      {children}
    </div>
  );
}
