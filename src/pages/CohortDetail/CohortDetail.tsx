import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCohort } from "@/services/cohortService";
import { updateCandidate } from "@/services/candidateService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { BANK_REQUIREMENTS, depositRequirement } from "@/constants/bank-requirements";

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
  applied_at: string;
  [key: string]: unknown;
}

const STATUSES = ["enrolled", "waitlisted", "rejected", "withdrawn", "graduated"] as const;
const TRAINING = ["not_started", "in_progress", "completed", "failed"] as const;

const DOCS: Array<[string, string]> = BANK_REQUIREMENTS.map((r) => [
  r.key,
  r.conditional ? `${r.label} (${r.conditional.toLowerCase()})` : r.label,
]);

function money(v: number | null | undefined) {
  return v == null ? "â€”" : `${Number(v).toLocaleString("en-RW")} RWF`;
}

export default function CohortDetail() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

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
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cohort = data?.cohort;
  const candidates = (data?.candidates ?? []) as Candidate[];
  const enrolled = candidates.filter((c) => c.status === "enrolled" || c.status === "graduated");
  const waiting = candidates.filter((c) => c.status === "waitlisted");
  const inactive = candidates.filter((c) => c.status === "rejected" || c.status === "withdrawn");

  function Row({ c }: { c: Candidate }) {
    const open = openId === c.id;
    const docsDone = DOCS.filter(([k]) => c[k] === true).length;
    return (
      <Card className="border-border/70 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-[190px]">
            <p className="font-display text-sm font-bold">{c.candidate_code}</p>
            <p className="text-sm text-muted-foreground">{c.full_name}</p>
          </div>
          <div className="min-w-[130px] text-sm text-muted-foreground">{c.phone}</div>
          <Badge variant={c.status === "enrolled" ? "default" : "secondary"}>
            {c.status}
            {c.waitlist_position ? ` #${c.waitlist_position}` : ""}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Docs {docsDone}/{DOCS.length}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Select
              value={c.status}
              onValueChange={(v) => update.mutate({ id: c.id, patch: { status: v } })}
            >
              <SelectTrigger className="h-9 w-[150px]">
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
            <Button variant="outline" size="sm" onClick={() => setOpenId(open ? null : c.id)}>
              {open ? "Hide" : "Details"}
            </Button>
          </div>
        </div>

        {open && (
          <div className="mt-5 grid gap-6 border-t border-border/60 pt-5 md:grid-cols-3">
            <Detail title="Identity">
              <Field label="National ID" value={c.national_id} />
              <Field label="Date of birth" value={c.date_of_birth} />
              <Field label="Gender" value={c.gender} />
              <Field label="Email" value={c.email} />
              <Field
                label="Residence"
                value={[c.district, c.sector, c.cell].filter(Boolean).join(" / ") || null}
              />
              <Field label="Education" value={c.education_level} />
              <Field label="Language" value={c.preferred_language} />
              <Field label="Smartphone" value={c.has_smartphone ? "Yes" : "No"} />
            </Detail>

            <Detail title="Driving">
              <Field label="Licence no." value={c.driving_license_number} />
              <Field label="Categories" value={c.license_categories} />
              <Field label="Issued" value={c.license_issue_date} />
              <Field label="Experience" value={`${c.years_driving_experience ?? "â€”"} yrs`} />
              <Field label="Association" value={c.taxi_association} />
              <Field label="Current plate" value={c.current_vehicle_plate} />
              <Field label="Driving for" value={c.currently_driving_for} />
            </Detail>

            <Detail title="Financing readiness">
              <Field label="Monthly income" value={money(c.monthly_income_rwf)} />
              <Field label="Daily takings" value={money(c.average_daily_earnings_rwf)} />
              <Field label="Bank" value={c.has_bank_account ? c.bank_name : "No account"} />
              <Field label="Account no." value={c.bank_account_number} />
              <Field
                label="Existing loan"
                value={c.has_existing_loan ? (c.existing_loan_details ?? "Yes") : "None"}
              />
              <Field label="Deposit ready" value={money(c.deposit_available_rwf)} />
              <Field label="UZA Access top-up" value={c.needs_uza_access_support ? "Yes" : "No"} />
              <Field label="Preferred term" value={`${c.preferred_term_years ?? "â€”"} yrs`} />
              <Field label="Payment route" value={c.preferred_financing} />
            </Detail>

            <Detail title="Bank eligibility">
              <Field label="Marital status" value={c.marital_status} />
              <Field label="Spouse" value={c.spouse_name} />
              <Field
                label="Cooperative"
                value={c.is_cooperative_member ? (c.cooperative_name ?? "Member") : "Not a member"}
              />
              <Field label="Target vehicle price" value={money(c.target_vehicle_price_rwf)} />
              <Field
                label="Deposit required"
                value={
                  c.target_vehicle_price_rwf
                    ? `${money(depositRequirement(Number(c.target_vehicle_price_rwf)).amount)} (${Math.round(
                        depositRequirement(Number(c.target_vehicle_price_rwf)).percent * 100,
                      )}%)`
                    : "â€”"
                }
              />
              <Field
                label="Collateral offered"
                value={
                  c.offers_collateral
                    ? `${money(c.collateral_value_rwf)} Â· ${c.collateral_description ?? ""}`
                    : "No"
                }
              />
              <Field
                label="CRB listing"
                value={c.listed_on_crb ? (c.crb_resolution_notes ?? "Listed â€” must clear") : "Clear"}
              />
              <Field label="Other loan bank" value={c.other_loan_bank} />
              <Field label="Separate repayment source" value={c.other_loan_repayment_source} />
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
                  .join(" Â· ")}
              />
              <Field
                label="Guarantor"
                value={[c.guarantor_name, c.guarantor_phone, c.guarantor_occupation]
                  .filter(Boolean)
                  .join(" Â· ")}
              />
            </Detail>

            <Detail title="Documents">
              <div className="space-y-2">
                {DOCS.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={c[key] === true}
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

            <Detail title="Training">
              <div className="space-y-3">
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
                <Field label="Attendance" value={`${c.attendance_percentage ?? "â€”"}%`} />
                <Field label="Exam score" value={`${c.exam_score ?? "â€”"}`} />
                <Field label="Notes" value={c.instructor_notes} />
                <Field label="Applied" value={new Date(c.applied_at).toLocaleDateString()} />
              </div>
            </Detail>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border/60 bg-background">
        <div className="container-page flex items-center justify-between py-4">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            â† All cohorts
          </Link>
        </div>
      </header>

      <main className="container-page py-10">
        {isPending && <p className="text-sm text-muted-foreground">Loading candidatesâ€¦</p>}
        {cohort && (
          <>
            <p className="text-eyebrow text-muted-foreground">{cohort.code}</p>
            <h1 className="mt-2 font-display text-3xl font-bold">{cohort.name}</h1>
            <p className="mt-2 text-muted-foreground">
              {enrolled.length} of {cohort.capacity} seats taken Â· {waiting.length} on the waiting
              list Â· {cohort.location ?? "Location TBC"}
            </p>

            <Section title={`Enrolled (${enrolled.length})`}>
              {enrolled.map((c) => (
                <Row key={c.id} c={c} />
              ))}
              {enrolled.length === 0 && <Empty>No candidates enrolled yet.</Empty>}
            </Section>

            <Section title={`Waiting list (${waiting.length})`}>
              {waiting.map((c) => (
                <Row key={c.id} c={c} />
              ))}
              {waiting.length === 0 && <Empty>Nobody is waiting for a seat.</Empty>}
            </Section>

            {inactive.length > 0 && (
              <Section title={`Rejected / withdrawn (${inactive.length})`}>
                {inactive.map((c) => (
                  <Row key={c.id} c={c} />
                ))}
              </Section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-eyebrow text-muted-foreground">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
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
      <span className="font-medium">{value === "" || value == null ? "â€”" : value}</span>
    </p>
  );
}
