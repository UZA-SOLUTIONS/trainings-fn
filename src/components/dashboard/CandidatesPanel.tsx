import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteCandidate,
  updateCandidate,
  type Candidate,
  type CandidateStatus,
  type LoanReviewStatus,
  type TrainingStatus,
  type UpdateCandidatePatch,
} from "@/services/candidateService";
import type { Cohort } from "@/services/cohortService";
import { BANK_REQUIREMENTS } from "@/constants/bank-requirements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const STATUSES: CandidateStatus[] = [
  "enrolled",
  "waitlisted",
  "rejected",
  "withdrawn",
  "graduated",
];

const TRAINING: TrainingStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "failed",
];

const LOAN_STATUSES: LoanReviewStatus[] = [
  "not_ready",
  "pending",
  "in_review",
  "approved",
  "declined",
  "more_info_needed",
];

const DOC_KEYS = BANK_REQUIREMENTS.map((r) => r.key);

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

function docsDone(c: Candidate) {
  return DOC_KEYS.filter((k) => c[k as keyof Candidate] === true).length;
}

export function CandidatesPanel({
  cohorts,
  candidates,
}: {
  cohorts: Cohort[];
  candidates: Candidate[];
}) {
  const queryClient = useQueryClient();
  const { can, isBankPartner, isInstructor } = useAuth();
  const canMembership = can("candidates.membership");
  const canTraining = can("candidates.training");
  const canLoan = can("candidates.loan");
  const canDelete = can("candidates.delete");

  const [search, setSearch] = useState("");
  const [cohortFilter, setCohortFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trainingFilter, setTrainingFilter] = useState<string>(
    isBankPartner ? "completed" : "all",
  );
  const [loanFilter, setLoanFilter] = useState<string>("all");

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: UpdateCandidatePatch }) =>
      updateCandidate(id, patch),
    onSuccess: () => {
      toast.success("Candidate updated");
      queryClient.invalidateQueries({ queryKey: ["manage-overview"] });
      queryClient.invalidateQueries({ queryKey: ["cohort-overview"] });
      queryClient.invalidateQueries({ queryKey: ["cohort"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deleteCandidate,
    onSuccess: () => {
      toast.success("Candidate deleted");
      queryClient.invalidateQueries({ queryKey: ["manage-overview"] });
      queryClient.invalidateQueries({ queryKey: ["cohort-overview"] });
      queryClient.invalidateQueries({ queryKey: ["cohort"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function confirmDelete(c: Candidate) {
    if (!window.confirm(`Delete candidate “${c.full_name}” (${c.candidate_code})?`)) return;
    remove.mutate(c.id);
  }

  function handleStatusChange(c: Candidate, value: string) {
    if (value === "rejected" && isInstructor) {
      const reason = window.prompt("Enter a training disqualification reason:");
      if (!reason?.trim()) {
        toast.error("A disqualification reason is required to reject a candidate");
        return;
      }
      update.mutate({
        id: c.id,
        patch: { status: value as CandidateStatus, disqualification_reason: reason.trim() },
      });
      return;
    }
    update.mutate({ id: c.id, patch: { status: value as CandidateStatus } });
  }

  const cohortName = useMemo(() => {
    const map = new Map(cohorts.map((c) => [c.id, c.name]));
    return (id: string) => map.get(id) ?? "—";
  }, [cohorts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates
      .filter((c) => (cohortFilter === "all" ? true : c.cohort_id === cohortFilter))
      .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
      .filter((c) => (trainingFilter === "all" ? true : c.training_status === trainingFilter))
      .filter((c) => (loanFilter === "all" ? true : c.loan_review_status === loanFilter))
      .filter((c) => {
        if (!q) return true;
        return (
          c.candidate_code.toLowerCase().includes(q) ||
          c.full_name.toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q) ||
          cohortName(c.cohort_id).toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));
  }, [candidates, cohortFilter, statusFilter, trainingFilter, loanFilter, search, cohortName]);

  const title = isBankPartner ? "Loan review" : "Candidates";
  const subtitle = isBankPartner ? "Applicants" : "Applicants";

  return (
    <div>
      <p className="text-eyebrow text-muted-foreground">{subtitle}</p>
      <h1 className="mt-2 font-display text-4xl font-bold">{title}</h1>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ID, name, phone…"
          className="h-10 sm:max-w-xs"
        />
        <Select value={cohortFilter} onValueChange={setCohortFilter}>
          <SelectTrigger className="h-10 w-full sm:w-[200px]">
            <SelectValue placeholder="Cohort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cohorts</SelectItem>
            {cohorts.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isBankPartner && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={trainingFilter} onValueChange={setTrainingFilter}>
          <SelectTrigger className="h-10 w-full sm:w-[170px]">
            <SelectValue placeholder="Training" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All training</SelectItem>
            {TRAINING.map((t) => (
              <SelectItem key={t} value={t}>
                {TRAINING_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(isBankPartner || canLoan) && (
          <Select value={loanFilter} onValueChange={setLoanFilter}>
            <SelectTrigger className="h-10 w-full sm:w-[170px]">
              <SelectValue placeholder="Loan status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All loan statuses</SelectItem>
              {LOAN_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {LOAN_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <p className="text-base text-muted-foreground sm:ml-auto">
          {filtered.length} of {candidates.length}
        </p>
      </div>

      <Card className="mt-6 overflow-hidden border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Cohort</TableHead>
              <TableHead>Phone</TableHead>
              {!isBankPartner && <TableHead>Status</TableHead>}
              {!isBankPartner && <TableHead>Training</TableHead>}
              {(isBankPartner || canLoan) && <TableHead>Loan</TableHead>}
              <TableHead>Docs</TableHead>
              {isBankPartner && <TableHead>CRB</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="min-w-0">
                    <p className="font-medium">{c.full_name}</p>
                    <p className="mt-0.5 font-mono text-sm font-semibold text-primary">
                      {c.candidate_code || "—"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <Link
                    to={`/cohorts/${c.cohort_id}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {cohortName(c.cohort_id)}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.phone || "—"}</TableCell>
                {!isBankPartner && (
                  <TableCell>
                    {canMembership ? (
                      <Select value={c.status} onValueChange={(v) => handleStatusChange(c, v)}>
                        <SelectTrigger className="h-9 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="secondary">{STATUS_LABELS[c.status] ?? c.status}</Badge>
                    )}
                  </TableCell>
                )}
                {!isBankPartner && (
                  <TableCell>
                    {canTraining ? (
                      <Select
                        value={c.training_status}
                        onValueChange={(v) =>
                          update.mutate({
                            id: c.id,
                            patch: { training_status: v as TrainingStatus },
                          })
                        }
                      >
                        <SelectTrigger className="h-9 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRAINING.map((t) => (
                            <SelectItem key={t} value={t}>
                              {TRAINING_LABELS[t]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-muted-foreground">
                        {TRAINING_LABELS[c.training_status] ?? c.training_status}
                      </span>
                    )}
                  </TableCell>
                )}
                {(isBankPartner || canLoan) && (
                  <TableCell>
                    {canLoan ? (
                      <Select
                        value={c.loan_review_status ?? "not_ready"}
                        onValueChange={(v) =>
                          update.mutate({
                            id: c.id,
                            patch: { loan_review_status: v as LoanReviewStatus },
                          })
                        }
                      >
                        <SelectTrigger className="h-9 w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LOAN_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {LOAN_LABELS[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-muted-foreground">
                        {LOAN_LABELS[c.loan_review_status] ?? c.loan_review_status}
                      </span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Badge variant="secondary">
                    {docsDone(c)}/{DOC_KEYS.length}
                  </Badge>
                </TableCell>
                {isBankPartner && (
                  <TableCell>
                    {c.listed_on_crb ? (
                      <Badge variant="destructive">Listed</Badge>
                    ) : (
                      <Badge variant="secondary">Clear</Badge>
                    )}
                  </TableCell>
                )}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {canDelete && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        disabled={remove.isPending}
                        onClick={() => confirmDelete(c)}
                      >
                        Delete
                      </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/cohorts/${c.cohort_id}`}>Open cohort</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No candidates match these filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

