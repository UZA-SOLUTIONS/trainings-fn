import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import type { BankTrackView } from "@/services/candidateService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRwf } from "@/utils/financing";

const STATUS_LABELS: Record<string, string> = {
  enrolled: "Enrolled",
  waitlisted: "Waiting list",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
  graduated: "Graduated",
};

const TRAINING_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Failed",
};

const LOAN_LABELS: Record<string, string> = {
  not_ready: "Not ready",
  pending: "Pending",
  in_review: "In review",
  approved: "Approved",
  declined: "Declined",
  more_info_needed: "More info needed",
};

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-xl border border-border/70 px-4 py-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className="mt-1 font-display text-3xl font-bold tabular-nums"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function formatApplied(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function BankTrackResult({ bank }: { bank: BankTrackView }) {
  const { summary } = bank;
  const [candidateQuery, setCandidateQuery] = useState("");

  const filtered = useMemo(() => {
    const q = candidateQuery.trim().toUpperCase();
    if (!q) return bank.candidates;
    return bank.candidates.filter((c) => {
      const hay = [
        c.candidate_code,
        c.full_name,
        c.phone,
        c.cohort?.code,
        c.cohort?.name,
        c.cohort?.location,
        STATUS_LABELS[c.status] ?? c.status,
        TRAINING_LABELS[c.training_status] ?? c.training_status,
        LOAN_LABELS[c.loan_review_status] ?? c.loan_review_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();
      return hay.includes(q) || c.candidate_code.toUpperCase().includes(q);
    });
  }, [bank.candidates, candidateQuery]);

  const exactMatch = useMemo(() => {
    const q = candidateQuery.trim().toUpperCase();
    if (!q) return null;
    return bank.candidates.find((c) => c.candidate_code.toUpperCase() === q) ?? null;
  }, [bank.candidates, candidateQuery]);

  return (
    <div className="space-y-8">
      <Card className="border-border/70 p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Bank portfolio
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {bank.name}
        </h2>
        <p className="mt-2 font-mono text-base font-semibold text-primary sm:text-lg">
          {bank.bank_id}
        </p>
        <p className="mt-3 text-base text-muted-foreground">
          Candidates in cohorts linked to this bank · code {bank.code}
          {!bank.is_active ? " · inactive" : ""}
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total candidates" value={summary.total_candidates} />
        <Stat label="Training completed" value={summary.training_completed} accent="var(--primary)" />
        <Stat label="In training" value={summary.training_in_progress} accent="var(--volt)" />
        <Stat label="Docs ready" value={summary.docs_ready} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Enrolled / graduated" value={summary.enrolled} />
        <Stat label="Waiting list" value={summary.waitlisted} />
        <Stat label="Not started" value={summary.training_not_started} />
        <Stat label="Training failed" value={summary.training_failed} />
      </div>

      {bank.cohorts.length > 0 && (
        <Card className="border-border/70 p-6 sm:p-8">
          <h3 className="font-display text-xl font-bold sm:text-2xl">Linked cohorts</h3>
          <ul className="mt-4 divide-y divide-border/60">
            {bank.cohorts.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline justify-between gap-2 py-3">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.code}
                    {c.location ? ` · ${c.location}` : ""}
                    {c.start_date ? ` · starts ${c.start_date}` : ""}
                  </p>
                </div>
                <p className="font-display text-2xl font-bold tabular-nums">{c.candidate_count}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="overflow-hidden border-border/70">
        <div className="space-y-4 border-b border-border/60 px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold sm:text-2xl">Applicants</h3>
              <p className="mt-1 text-muted-foreground">
                Training, documents, financing, and contact details
              </p>
            </div>
            <p className="text-sm tabular-nums text-muted-foreground">
              Showing {filtered.length} of {bank.candidates.length}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <FiSearch
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={candidateQuery}
                onChange={(e) => setCandidateQuery(e.target.value.toUpperCase())}
                placeholder="Search candidate ID (UZA-2026-00001), name, phone…"
                className="h-11 border-border/70 pl-10 font-display tracking-wide"
                autoComplete="off"
                spellCheck={false}
                aria-label="Filter applicants by candidate ID or details"
              />
            </div>
            {candidateQuery && (
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0"
                onClick={() => setCandidateQuery("")}
              >
                Clear
              </Button>
            )}
            {exactMatch && (
              <Button asChild className="h-11 shrink-0">
                <Link to={`/track?id=${encodeURIComponent(exactMatch.candidate_code)}`}>
                  Open {exactMatch.candidate_code}
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[12rem]">Candidate ID</TableHead>
                <TableHead className="min-w-[10rem]">Name / phone</TableHead>
                <TableHead className="min-w-[9rem]">Status</TableHead>
                <TableHead className="min-w-[11rem]">Cohort</TableHead>
                <TableHead className="min-w-[9rem]">Training</TableHead>
                <TableHead>Docs</TableHead>
                <TableHead className="min-w-[8rem]">Loan</TableHead>
                <TableHead className="min-w-[8rem]">Deposit</TableHead>
                <TableHead className="min-w-[7rem]">Applied</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.candidate_code}>
                  <TableCell>
                    <p className="font-mono text-sm font-bold text-primary">{c.candidate_code}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{c.full_name}</p>
                    <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                      {c.phone || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === "enrolled" || c.status === "graduated"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {STATUS_LABELS[c.status] ?? c.status}
                      {c.waitlist_position ? ` #${c.waitlist_position}` : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{c.cohort?.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.cohort?.code ?? ""}
                      {c.cohort?.location ? ` · ${c.cohort.location}` : ""}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">
                      {TRAINING_LABELS[c.training_status] ?? c.training_status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Att. {c.attendance_percentage != null ? `${c.attendance_percentage}%` : "—"}
                      {" · "}
                      Exam {c.exam_score != null ? `${c.exam_score}%` : "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-display text-lg font-bold tabular-nums">
                      {c.documents_percent}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {c.documents_complete}/{c.documents_required}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {LOAN_LABELS[c.loan_review_status] ?? c.loan_review_status}
                    </Badge>
                    {c.listed_on_crb && (
                      <p className="mt-1 text-xs text-destructive">CRB listed</p>
                    )}
                    {c.preferred_financing && (
                      <p className="mt-1 text-xs text-muted-foreground">{c.preferred_financing}</p>
                    )}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {c.deposit_available_rwf != null
                      ? formatRwf(c.deposit_available_rwf, { compact: true })
                      : "—"}
                    {c.needs_uza_access_support && (
                      <p className="text-xs text-foreground">UZA Access</p>
                    )}
                    {c.target_vehicle_price_rwf != null && (
                      <p className="text-xs text-muted-foreground">
                        Target {formatRwf(c.target_vehicle_price_rwf, { compact: true })}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatApplied(c.applied_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/track?id=${encodeURIComponent(c.candidate_code)}`}>Track</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {bank.candidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    No candidates are linked to this bank yet. Link cohorts to the bank in Admin.
                  </TableCell>
                </TableRow>
              )}
              {bank.candidates.length > 0 && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                    No applicants match “{candidateQuery.trim()}”. Try another candidate ID or name.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
