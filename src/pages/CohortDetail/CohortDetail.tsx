import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCohort } from "@/services/cohortService";
import { updateCandidate } from "@/services/candidateService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BANK_REQUIREMENTS, depositRequirement } from "@/constants/bank-requirements";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Candidate {
  id: string;
  candidate_code: string;
  full_name: string;
  phone: string | null;
  status: string;
  waitlist_position: number | null;
  training_status: string;
  national_id?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  email?: string | null;
  district?: string | null;
  sector?: string | null;
  cell?: string | null;
  education_level?: string | null;
  preferred_language?: string | null;
  has_smartphone?: boolean | null;
  driving_license_number?: string | null;
  license_categories?: string | null;
  license_issue_date?: string | null;
  years_driving_experience?: number | null;
  taxi_association?: string | null;
  current_vehicle_plate?: string | null;
  currently_driving_for?: string | null;
  monthly_income_rwf?: number | null;
  average_daily_earnings_rwf?: number | null;
  has_bank_account?: boolean | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  has_existing_loan?: boolean | null;
  existing_loan_details?: string | null;
  deposit_available_rwf?: number | null;
  needs_uza_access_support?: boolean | null;
  preferred_term_years?: number | null;
  preferred_financing?: string | null;
  marital_status?: string | null;
  spouse_name?: string | null;
  is_cooperative_member?: boolean | null;
  cooperative_name?: string | null;
  target_vehicle_price_rwf?: number | null;
  offers_collateral?: boolean | null;
  collateral_value_rwf?: number | null;
  collateral_description?: string | null;
  listed_on_crb?: boolean | null;
  crb_resolution_notes?: string | null;
  other_loan_bank?: string | null;
  other_loan_repayment_source?: string | null;
  previously_drove_for_service?: boolean | null;
  next_of_kin_name?: string | null;
  next_of_kin_phone?: string | null;
  next_of_kin_relationship?: string | null;
  guarantor_name?: string | null;
  guarantor_phone?: string | null;
  guarantor_occupation?: string | null;
  attendance_percentage?: number | null;
  exam_score?: number | null;
  instructor_notes?: string | null;
  disqualification_reason?: string | null;
  loan_review_status?: string | null;
  bank_notes?: string | null;
  applied_at: string;
  [key: string]: unknown;
}

const STATUSES = ["enrolled", "waitlisted", "rejected", "withdrawn", "graduated"] as const;
const TRAINING = ["not_started", "in_progress", "completed", "failed"] as const;
const LOAN_STATUSES = [
  "not_ready",
  "pending",
  "in_review",
  "approved",
  "declined",
  "more_info_needed",
] as const;

const DOCS: Array<[string, string]> = BANK_REQUIREMENTS.map((r) => [
  r.key,
  r.conditional ? `${r.label} (${r.conditional.toLowerCase()})` : r.label,
]);

function money(v: number | null | undefined) {
  return v == null ? "—" : `${Number(v).toLocaleString("en-RW")} RWF`;
}

export default function CohortDetail() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const { can, isInstructor, isBankPartner } = useAuth();

  useEffect(() => {
    if (isBankPartner) {
      navigate("/dashboard?tab=candidates", { replace: true });
    }
  }, [isBankPartner, navigate]);

  if (isBankPartner) {
    return <p className="text-base text-muted-foreground">Redirecting…</p>;
  }
  const canMembership = can("candidates.membership");
  const canTraining = can("candidates.training");
  const canDocuments = can("candidates.documents");
  const canLoan = can("candidates.loan");

  const { data, isPending } = useQuery({
    queryKey: ["cohort", cohortId],
    queryFn: () => getCohort(cohortId!),
    enabled: Boolean(cohortId),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      await updateCandidate(id, patch);
    },
    onSuccess: () => {
      toast.success("Candidate updated");
      queryClient.invalidateQueries({ queryKey: ["cohort", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["cohort-overview"] });
      queryClient.invalidateQueries({ queryKey: ["manage-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cohort = data?.cohort;
  const candidates = (data?.candidates ?? []) as Candidate[];
  const enrolled = candidates.filter((c) => c.status === "enrolled" || c.status === "graduated");
  const waiting = candidates.filter((c) => c.status === "waitlisted");
  const inactive = candidates.filter((c) => c.status === "rejected" || c.status === "withdrawn");

  function handleStatusChange(c: Candidate, value: string) {
    if (value === "rejected" && isInstructor) {
      const reason = window.prompt("Enter a training disqualification reason:");
      if (!reason?.trim()) {
        toast.error("A disqualification reason is required to reject a candidate");
        return;
      }
      update.mutate({
        id: c.id,
        patch: { status: value, disqualification_reason: reason.trim() },
      });
      return;
    }
    update.mutate({ id: c.id, patch: { status: value } });
  }

  function CandidateTable({ rows, empty }: { rows: Candidate[]; empty: string }) {
    if (rows.length === 0) {
      return <Empty>{empty}</Empty>;
    }

    return (
      <Card className="overflow-hidden border-border/70 shadow-none">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Candidate</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Training</TableHead>
              <TableHead>Docs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c) => {
              const open = openId === c.id;
              const docsDone = DOCS.filter(([k]) => c[k] === true).length;
              return (
                <Fragment key={c.id}>
                  <TableRow>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium">{c.full_name}</p>
                        <p className="mt-0.5 font-mono text-sm font-semibold text-primary">
                          {c.candidate_code || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.phone ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === "enrolled" ? "default" : "secondary"}>
                        {c.status}
                        {c.waitlist_position ? ` #${c.waitlist_position}` : ""}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.training_status}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {docsDone}/{DOCS.length}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canMembership && (
                          <Select
                            value={c.status}
                            onValueChange={(v) => handleStatusChange(c, v)}
                          >
                            <SelectTrigger className="h-9 w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenId(open ? null : c.id)}
                        >
                          {open ? "Hide" : "Details"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {open && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="bg-muted/20 p-0">
                        <div className="grid gap-6 border-t border-border/60 p-5 md:grid-cols-3">
                          <Detail title="Identity">
                            <Field label="Candidate ID" value={c.candidate_code} />
                            <Field label="National ID" value={c.national_id} />
                            <Field label="Date of birth" value={c.date_of_birth} />
                            <Field label="Gender" value={c.gender} />
                            <Field label="Email" value={c.email} />
                            <Field
                              label="Residence"
                              value={
                                [c.district, c.sector, c.cell].filter(Boolean).join(" / ") || null
                              }
                            />
                            <Field label="Education" value={c.education_level} />
                            <Field label="Language" value={c.preferred_language} />
                            <Field label="Smartphone" value={c.has_smartphone ? "Yes" : "No"} />
                          </Detail>

                          <Detail title="Driving">
                            <Field label="Licence no." value={c.driving_license_number} />
                            <Field label="Categories" value={c.license_categories} />
                            <Field label="Issued" value={c.license_issue_date} />
                            <Field
                              label="Experience"
                              value={`${c.years_driving_experience ?? "—"} yrs`}
                            />
                            <Field label="Association" value={c.taxi_association} />
                            <Field label="Current plate" value={c.current_vehicle_plate} />
                            <Field label="Driving for" value={c.currently_driving_for} />
                          </Detail>

                          <Detail title="Financing readiness">
                            <Field label="Monthly income" value={money(c.monthly_income_rwf)} />
                            <Field label="Daily takings" value={money(c.average_daily_earnings_rwf)} />
                            <Field
                              label="Bank"
                              value={c.has_bank_account ? c.bank_name : "No account"}
                            />
                            <Field label="Account no." value={c.bank_account_number} />
                            <Field
                              label="Existing loan"
                              value={
                                c.has_existing_loan ? (c.existing_loan_details ?? "Yes") : "None"
                              }
                            />
                            <Field label="Deposit ready" value={money(c.deposit_available_rwf)} />
                            <Field
                              label="UZA Access top-up"
                              value={c.needs_uza_access_support ? "Yes" : "No"}
                            />
                            <Field
                              label="Preferred term"
                              value={`${c.preferred_term_years ?? "—"} yrs`}
                            />
                            <Field label="Payment route" value={c.preferred_financing} />
                          </Detail>

                          <Detail title="Bank eligibility">
                            <Field label="Marital status" value={c.marital_status} />
                            <Field label="Spouse" value={c.spouse_name} />
                            <Field
                              label="Cooperative"
                              value={
                                c.is_cooperative_member
                                  ? (c.cooperative_name ?? "Member")
                                  : "Not a member"
                              }
                            />
                            <Field
                              label="Target vehicle price"
                              value={money(c.target_vehicle_price_rwf)}
                            />
                            <Field
                              label="Deposit required"
                              value={
                                c.target_vehicle_price_rwf
                                  ? `${money(depositRequirement(Number(c.target_vehicle_price_rwf)).amount)} (${Math.round(
                                      depositRequirement(Number(c.target_vehicle_price_rwf))
                                        .percent * 100,
                                    )}%)`
                                  : "—"
                              }
                            />
                            <Field
                              label="Collateral offered"
                              value={
                                c.offers_collateral
                                  ? `${money(c.collateral_value_rwf)} · ${c.collateral_description ?? ""}`
                                  : "No"
                              }
                            />
                            <Field
                              label="CRB listing"
                              value={
                                c.listed_on_crb
                                  ? (c.crb_resolution_notes ?? "Listed — must clear")
                                  : "Clear"
                              }
                            />
                            <Field label="Other loan bank" value={c.other_loan_bank} />
                            <Field
                              label="Separate repayment source"
                              value={c.other_loan_repayment_source}
                            />
                            <Field
                              label="Drove for another service"
                              value={c.previously_drove_for_service ? "Yes" : "No"}
                            />
                          </Detail>

                          <Detail title="Next of kin & guarantor">
                            <Field
                              label="Next of kin"
                              value={[c.next_of_kin_name, c.next_of_kin_phone, c.next_of_kin_relationship]
                                .filter(Boolean)
                                .join(" · ")}
                            />
                            <Field
                              label="Guarantor"
                              value={[c.guarantor_name, c.guarantor_phone, c.guarantor_occupation]
                                .filter(Boolean)
                                .join(" · ")}
                            />
                          </Detail>

                          <Detail title="Documents">
                            <div className="space-y-2">
                              {DOCS.map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={c[key] === true}
                                    disabled={!canDocuments}
                                    onChange={(e) =>
                                      update.mutate({
                                        id: c.id,
                                        patch: { [key]: e.target.checked },
                                      })
                                    }
                                  />
                                  {label}
                                </label>
                              ))}
                            </div>
                          </Detail>

                          {(canLoan || isBankPartner) && (
                            <Detail title="Loan review">
                              <div className="space-y-3">
                                {canLoan ? (
                                  <>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs text-muted-foreground">
                                        Loan status
                                      </Label>
                                      <Select
                                        value={c.loan_review_status ?? "not_ready"}
                                        onValueChange={(v) =>
                                          update.mutate({
                                            id: c.id,
                                            patch: { loan_review_status: v },
                                          })
                                        }
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {LOAN_STATUSES.map((s) => (
                                            <SelectItem key={s} value={s}>
                                              {s.replaceAll("_", " ")}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs text-muted-foreground">
                                        CRB resolution notes
                                      </Label>
                                      <Input
                                        defaultValue={c.crb_resolution_notes ?? ""}
                                        onBlur={(e) =>
                                          update.mutate({
                                            id: c.id,
                                            patch: { crb_resolution_notes: e.target.value },
                                          })
                                        }
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <Label className="text-xs text-muted-foreground">
                                        Bank notes
                                      </Label>
                                      <Input
                                        defaultValue={c.bank_notes ?? ""}
                                        onBlur={(e) =>
                                          update.mutate({
                                            id: c.id,
                                            patch: { bank_notes: e.target.value || null },
                                          })
                                        }
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Field
                                      label="Loan status"
                                      value={c.loan_review_status?.replaceAll("_", " ")}
                                    />
                                    <Field label="CRB notes" value={c.crb_resolution_notes} />
                                    <Field label="Bank notes" value={c.bank_notes} />
                                  </>
                                )}
                              </div>
                            </Detail>
                          )}

                          <Detail title="Training">
                            <div className="space-y-3">
                              {canTraining ? (
                                <>
                                  <Select
                                    value={c.training_status}
                                    onValueChange={(v) =>
                                      update.mutate({
                                        id: c.id,
                                        patch: { training_status: v },
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TRAINING.map((s) => (
                                        <SelectItem key={s} value={s}>
                                          {s}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                      Attendance %
                                    </Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      defaultValue={c.attendance_percentage ?? ""}
                                      onBlur={(e) =>
                                        update.mutate({
                                          id: c.id,
                                          patch: {
                                            attendance_percentage: e.target.value
                                              ? Number(e.target.value)
                                              : null,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">
                                      Exam score
                                    </Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      defaultValue={c.exam_score ?? ""}
                                      onBlur={(e) =>
                                        update.mutate({
                                          id: c.id,
                                          patch: {
                                            exam_score: e.target.value
                                              ? Number(e.target.value)
                                              : null,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-xs text-muted-foreground">Notes</Label>
                                    <Input
                                      defaultValue={c.instructor_notes ?? ""}
                                      onBlur={(e) =>
                                        update.mutate({
                                          id: c.id,
                                          patch: {
                                            instructor_notes: e.target.value || null,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Field label="Status" value={c.training_status} />
                                  <Field
                                    label="Attendance"
                                    value={`${c.attendance_percentage ?? "—"}%`}
                                  />
                                  <Field label="Exam score" value={`${c.exam_score ?? "—"}`} />
                                  <Field label="Notes" value={c.instructor_notes} />
                                </>
                              )}
                              <Field
                                label="Applied"
                                value={new Date(c.applied_at).toLocaleDateString()}
                              />
                            </div>
                          </Detail>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    );
  }

  return (
    <div>
      <Link
        to="/dashboard?tab=candidates"
        className="inline-flex text-base text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Candidates
      </Link>

      <div className="mt-6">
        {isPending && <p className="text-base text-muted-foreground">Loading candidates…</p>}
        {cohort && (
          <>
            <p className="text-eyebrow text-muted-foreground">{cohort.code}</p>
            <h1 className="mt-2 font-display text-4xl font-bold">{cohort.name}</h1>

            <Section title={`Enrolled (${enrolled.length})`}>
              <CandidateTable rows={enrolled} empty="No candidates enrolled yet." />
            </Section>

            <Section title={`Waiting list (${waiting.length})`}>
              <CandidateTable rows={waiting} empty="Nobody is waiting for a seat." />
            </Section>

            {inactive.length > 0 && (
              <Section title={`Rejected / withdrawn (${inactive.length})`}>
                <CandidateTable rows={inactive} empty="" />
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-eyebrow text-muted-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-base text-muted-foreground">{children}</p>;
}

function Detail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="text-eyebrow text-muted-foreground">{title}</h3>
      <div className="mt-3 space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <p className="text-sm">
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value === "" || value == null ? "—" : value}</span>
    </p>
  );
}
