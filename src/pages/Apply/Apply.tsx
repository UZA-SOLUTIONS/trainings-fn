import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { FiCheck } from "react-icons/fi";
import { listCohorts } from "@/services/cohortService";
import { submitApplication } from "@/services/candidateService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { depositRequirement } from "@/constants/bank-requirements";
import { formatRwf } from "@/utils/financing";
import { cn } from "@/lib/utils";
import {
  Field,
  TextField,
  MoneyField,
  AreaField,
  ChoiceField,
  CheckField,
} from "@/components/forms";

const schema = z.object({
  cohort_id: z.string().regex(/^[a-fA-F0-9]{24}$/, { message: "Choose a cohort" }),
  full_name: z.string().trim().min(2, "Enter your full name").max(120),
  national_id: z.string().trim().min(5, "Enter your national ID").max(32),
  date_of_birth: z.string().min(1, "Enter your date of birth"),
  gender: z.string().min(1, "Select your gender"),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(20),
  email: z.string().trim().email("Invalid email").max(255).or(z.literal("")),
  district: z.string().trim().min(2, "Enter your district").max(60),
  sector: z.string().trim().max(60),
  cell: z.string().trim().max(60),
  education_level: z.string().max(60),
  preferred_language: z.string().max(40),
  driving_license_number: z.string().trim().min(3, "Enter your licence number").max(40),
  license_categories: z.string().trim().max(40),
  license_issue_date: z.string(),
  years_driving_experience: z.coerce.number().min(0).max(60),
  taxi_association: z.string().trim().max(120),
  current_vehicle_plate: z.string().trim().max(20),
  currently_driving_for: z.string().trim().max(120),
  monthly_income_rwf: z.coerce.number().min(0),
  average_daily_earnings_rwf: z.coerce.number().min(0),
  bank_name: z.string().trim().max(80),
  bank_account_number: z.string().trim().max(40),
  existing_loan_details: z.string().trim().max(300),
  deposit_available_rwf: z.coerce.number().min(0),
  preferred_term_years: z.coerce.number().min(1).max(5),
  preferred_financing: z.string().max(60),
  next_of_kin_name: z.string().trim().max(120),
  next_of_kin_phone: z.string().trim().max(20),
  next_of_kin_relationship: z.string().trim().max(60),
  guarantor_name: z.string().trim().max(120),
  guarantor_phone: z.string().trim().max(20),
  guarantor_occupation: z.string().trim().max(80),
  marital_status: z.string().min(1, "Select your marital status"),
  spouse_name: z.string().trim().max(120),
  cooperative_name: z.string().trim().max(120),
  target_vehicle_price_rwf: z.coerce.number().min(0),
  collateral_description: z.string().trim().max(300),
  collateral_value_rwf: z.coerce.number().min(0),
  crb_resolution_notes: z.string().trim().max(300),
  other_loan_bank: z.string().trim().max(120),
  other_loan_repayment_source: z.string().trim().max(300),
});

const initial = {
  cohort_id: "",
  full_name: "",
  national_id: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  email: "",
  district: "",
  sector: "",
  cell: "",
  education_level: "",
  preferred_language: "Kinyarwanda",
  has_smartphone: false,
  driving_license_number: "",
  license_categories: "",
  license_issue_date: "",
  years_driving_experience: "",
  taxi_association: "",
  current_vehicle_plate: "",
  currently_driving_for: "",
  monthly_income_rwf: "",
  average_daily_earnings_rwf: "",
  has_bank_account: false,
  bank_name: "",
  bank_account_number: "",
  has_existing_loan: false,
  existing_loan_details: "",
  deposit_available_rwf: "",
  needs_uza_access_support: false,
  preferred_term_years: "3",
  preferred_financing: "Bank financed",
  next_of_kin_name: "",
  next_of_kin_phone: "",
  next_of_kin_relationship: "",
  guarantor_name: "",
  guarantor_phone: "",
  guarantor_occupation: "",
  marital_status: "",
  spouse_name: "",
  is_cooperative_member: false,
  cooperative_name: "",
  target_vehicle_price_rwf: "",
  offers_collateral: false,
  collateral_description: "",
  collateral_value_rwf: "",
  listed_on_crb: false,
  crb_resolution_notes: "",
  other_loan_bank: "",
  other_loan_repayment_source: "",
  previously_drove_for_service: false,
};

type FormState = typeof initial;
type Errors = Partial<Record<string, string>>;

const STEPS = [
  {
    title: "Cohort",
    blurb: "Choose the intake you want to join.",
    fields: ["cohort_id"],
  },
  {
    title: "About you",
    blurb: "Identity and how we reach you.",
    fields: [
      "full_name",
      "national_id",
      "date_of_birth",
      "gender",
      "phone",
      "email",
      "district",
      "sector",
      "cell",
      "education_level",
      "preferred_language",
    ],
  },
  {
    title: "Driving",
    blurb: "Licence and experience.",
    fields: [
      "driving_license_number",
      "license_categories",
      "license_issue_date",
      "years_driving_experience",
      "taxi_association",
      "current_vehicle_plate",
      "currently_driving_for",
    ],
  },
  {
    title: "Income",
    blurb: "Earnings and deposit.",
    fields: [
      "monthly_income_rwf",
      "average_daily_earnings_rwf",
      "bank_name",
      "bank_account_number",
      "existing_loan_details",
      "deposit_available_rwf",
      "preferred_term_years",
      "preferred_financing",
    ],
  },
  {
    title: "Bank checks",
    blurb: "What the lender needs to see.",
    fields: [
      "marital_status",
      "spouse_name",
      "cooperative_name",
      "target_vehicle_price_rwf",
      "collateral_value_rwf",
      "collateral_description",
      "crb_resolution_notes",
      "other_loan_bank",
      "other_loan_repayment_source",
    ],
  },
  {
    title: "References",
    blurb: "Next of kin and guarantor.",
    fields: [
      "next_of_kin_name",
      "next_of_kin_phone",
      "next_of_kin_relationship",
      "guarantor_name",
      "guarantor_phone",
      "guarantor_occupation",
    ],
  },
] as const;

export default function Apply() {
  const [params] = useSearchParams();
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    status: string;
    position: number | null;
  } | null>(null);

  const { data: cohorts, isError, error, refetch } = useQuery({
    queryKey: ["open-cohorts"],
    queryFn: () => listCohorts({ open: true }),
  });

  useEffect(() => {
    const cohortId = params.get("cohort");
    if (!cohortId || !cohorts?.some((c) => c.id === cohortId)) return;
    setForm((f) => (f.cohort_id === cohortId ? f : { ...f, cohort_id: cohortId }));
  }, [params, cohorts]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key as string] ? { ...e, [key as string]: undefined } : e));
  }

  function collectErrors(fields: readonly string[]): Errors {
    const parsed = schema.safeParse(form);
    if (parsed.success) return {};
    const out: Errors = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (fields.includes(key) && !out[key]) out[key] = issue.message;
    }
    return out;
  }

  function goNext() {
    const found = collectErrors(STEPS[step]!.fields);
    if (Object.keys(found).length) {
      setErrors(found);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const firstBadStep = STEPS.findIndex((s) =>
        parsed.error.issues.some((i) => s.fields.includes(String(i.path[0]) as never)),
      );
      if (firstBadStep >= 0) {
        setStep(firstBadStep);
        setErrors(collectErrors(STEPS[firstBadStep]!.fields));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    try {
      const v = parsed.data;
      const data = await submitApplication({
        ...v,
        email: v.email || null,
        license_issue_date: v.license_issue_date || null,
        has_smartphone: form.has_smartphone,
        has_bank_account: form.has_bank_account,
        has_existing_loan: form.has_existing_loan,
        needs_uza_access_support: form.needs_uza_access_support,
        is_cooperative_member: form.is_cooperative_member,
        offers_collateral: form.offers_collateral,
        listed_on_crb: form.listed_on_crb,
        previously_drove_for_service: form.previously_drove_for_service,
      });
      setResult({
        code: data.candidate_code,
        status: data.status,
        position: data.waitlist_position,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not submit application";
      toast.error(msg.includes("duplicate") ? "You have already applied to this cohort." : msg);
    } finally {
      setBusy(false);
    }
  }

  const deposit = useMemo(() => {
    const price = Number(form.target_vehicle_price_rwf);
    return price > 0 ? depositRequirement(price) : null;
  }, [form.target_vehicle_price_rwf]);

  if (result) {
    const enrolled = result.status === "enrolled";
    return (
      <div className="relative overflow-hidden bg-ink py-16 text-ink-foreground md:py-24">
        <img
          src="/hero.avif"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-[oklch(0.16_0.04_158)]/88" />

        <div className="relative z-10 container-page flex justify-center">
          <div className="w-full max-w-lg rounded-3xl border border-white/12 bg-white/[0.06] p-8 backdrop-blur-sm md:p-10">
            <p className="text-eyebrow text-volt">Application received</p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
              {enrolled ? "You have a seat." : "You're on the waiting list."}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-foreground/70">
              {enrolled
                ? "Your instructor will share the training schedule and document checklist."
                : `Queue position ${result.position}. You'll move into a seat automatically if one opens.`}
            </p>

            <div className="mt-8 border border-white/12 bg-ink/40 px-5 py-5">
              <p className="text-eyebrow text-ink-foreground/45">Candidate ID</p>
              <p className="mt-2 font-display text-3xl font-bold tracking-tight text-volt">
                {result.code}
              </p>
              <p className="mt-2 text-xs text-ink-foreground/55">
                Keep this number for training, documents, financing and allocation.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-volt text-volt-foreground hover:bg-volt/90">
                <Link to="/">Back to home</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/25 bg-transparent text-ink-foreground hover:bg-white/10"
              >
                <Link to="/requirements">Document checklist</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = STEPS[step]!;
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="bg-background">
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="container-page py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-eyebrow text-muted-foreground">Application</p>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
                Driver training
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                About 10 minutes.{" "}
                <Link
                  to="/requirements"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  See documents
                </Link>
              </p>

              <ol className="mt-8 space-y-1">
                {STEPS.map((s, i) => {
                  const done = i < step;
                  const active = i === step;
                  return (
                    <li key={s.title}>
                      <button
                        type="button"
                        onClick={() => done && setStep(i)}
                        disabled={i > step}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                          active && "bg-primary text-primary-foreground",
                          done && !active && "text-foreground hover:bg-muted",
                          i > step && "cursor-not-allowed text-muted-foreground/50",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold",
                            active && "bg-volt text-volt-foreground",
                            done && !active && "bg-primary/10 text-primary",
                            i > step && "bg-muted text-muted-foreground",
                          )}
                        >
                          {done && !active ? <FiCheck size={14} aria-hidden /> : i + 1}
                        </span>
                        <span className="font-medium">{s.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </aside>

          <div className="min-w-0">
            {step === 0 && (
              <div className="relative mb-6 overflow-hidden rounded-2xl sm:mb-8 sm:rounded-3xl">
                <img
                  src="/hero.avif"
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[oklch(0.16_0.04_158)]/78" />
                <div className="relative px-5 py-7 text-ink-foreground sm:px-6 sm:py-8 md:px-8 md:py-10">
                  <p className="text-eyebrow text-volt">Call for applications</p>
                  <h2 className="mt-2 max-w-lg font-display text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                    Apply for Tunga Taxi training
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-foreground/75">
                    30 seats per cohort. Later applicants join the waiting list in order.
                  </p>
                </div>
              </div>
            )}

            <ol className="mb-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              {STEPS.map((s, i) => (
                <li key={s.title} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={cn(
                      "min-h-10 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors",
                      i === step
                        ? "border-primary bg-primary text-primary-foreground"
                        : i < step
                          ? "border-border bg-background text-foreground"
                          : "border-border/60 text-muted-foreground",
                    )}
                  >
                    {i + 1}. {s.title}
                  </button>
                </li>
              ))}
            </ol>

            <form onSubmit={submit}>
              <Card className="overflow-hidden rounded-3xl border-border/70 p-0 shadow-none">
                <div className="border-b border-border/60 bg-muted/30 px-6 py-5 md:px-8">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <p className="text-eyebrow text-muted-foreground">
                        Step {step + 1} of {STEPS.length}
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                        {current.title}
                      </h2>
                    </div>
                    <span className="hidden font-display text-4xl font-bold text-primary/15 sm:block">
                      {String(step + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{current.blurb}</p>
                </div>

                <div className="p-6 md:p-8">
            {step === 0 && (
              <Grid>
                {isError && (
                  <div className="md:col-span-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm font-medium text-destructive">
                      Cannot load open cohorts from the server
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {error instanceof Error ? error.message : "Request failed"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => refetch()}
                    >
                      Try again
                    </Button>
                  </div>
                )}
                <Field
                  className="md:col-span-2"
                  label="Training cohort"
                  error={errors.cohort_id}
                >
                  <Select value={form.cohort_id} onValueChange={(v) => set("cohort_id", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      {(cohorts ?? []).map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {c.start_date ?? "date TBC"} · {c.capacity} seats
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {(cohorts ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground md:col-span-2">
                    No cohorts are open right now. Check back soon.
                  </p>
                )}
              </Grid>
            )}

            {step === 1 && (
              <Grid>
                <TextField
                  label="Full name"
                  value={form.full_name}
                  onChange={(v) => set("full_name", v)}
                  error={errors.full_name}
                  placeholder="As on your national ID"
                />
                <TextField
                  label="National ID number"
                  value={form.national_id}
                  onChange={(v) => set("national_id", v)}
                  error={errors.national_id}
                  inputMode="numeric"
                />
                <TextField
                  label="Date of birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(v) => set("date_of_birth", v)}
                  error={errors.date_of_birth}
                />
                <ChoiceField
                  label="Gender"
                  value={form.gender}
                  options={["Male", "Female", "Other"]}
                  onChange={(v) => set("gender", v)}
                  error={errors.gender}
                />
                <TextField
                  label="Phone number"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  error={errors.phone}
                  inputMode="tel"
                  placeholder="07XX XXX XXX"
                />
                <TextField
                  label="Email"
                  type="email"
                  optional
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  error={errors.email}
                />
                <TextField
                  label="District"
                  value={form.district}
                  onChange={(v) => set("district", v)}
                  error={errors.district}
                />
                <TextField
                  label="Sector"
                  optional
                  value={form.sector}
                  onChange={(v) => set("sector", v)}
                />
                <TextField label="Cell" optional value={form.cell} onChange={(v) => set("cell", v)} />
                <ChoiceField
                  label="Highest education"
                  optional
                  value={form.education_level}
                  options={["Primary", "Ordinary level", "Advanced level", "TVET", "University"]}
                  onChange={(v) => set("education_level", v)}
                />
                <ChoiceField
                  label="Preferred language"
                  value={form.preferred_language}
                  options={["Kinyarwanda", "English", "French", "Swahili"]}
                  onChange={(v) => set("preferred_language", v)}
                />
                <CheckField
                  className="md:col-span-2"
                  label="I own a smartphone"
                  checked={form.has_smartphone}
                  onChange={(v) => set("has_smartphone", v)}
                />
              </Grid>
            )}

            {step === 2 && (
              <Grid>
                <TextField
                  label="Driving licence number"
                  value={form.driving_license_number}
                  onChange={(v) => set("driving_license_number", v)}
                  error={errors.driving_license_number}
                />
                <TextField
                  label="Licence categories"
                  optional
                  placeholder="e.g. B, D"
                  value={form.license_categories}
                  onChange={(v) => set("license_categories", v)}
                />
                <TextField
                  label="Licence issue date"
                  type="date"
                  optional
                  value={form.license_issue_date}
                  onChange={(v) => set("license_issue_date", v)}
                />
                <TextField
                  label="Years of driving experience"
                  type="number"
                  value={form.years_driving_experience}
                  onChange={(v) => set("years_driving_experience", v)}
                  error={errors.years_driving_experience}
                />
                <TextField
                  label="Taxi association / cooperative"
                  optional
                  value={form.taxi_association}
                  onChange={(v) => set("taxi_association", v)}
                />
                <TextField
                  label="Current vehicle plate"
                  optional
                  value={form.current_vehicle_plate}
                  onChange={(v) => set("current_vehicle_plate", v)}
                />
                <TextField
                  label="Currently driving for"
                  optional
                  placeholder="e.g. Yego Cabs, own taxi"
                  value={form.currently_driving_for}
                  onChange={(v) => set("currently_driving_for", v)}
                />
                <CheckField
                  className="md:col-span-2"
                  label="I previously drove for another taxi service"
                  checked={form.previously_drove_for_service}
                  onChange={(v) => set("previously_drove_for_service", v)}
                />
              </Grid>
            )}

            {step === 3 && (
              <Grid>
                <MoneyField
                  label="Monthly income"
                  value={form.monthly_income_rwf}
                  onChange={(v) => set("monthly_income_rwf", v)}
                  error={errors.monthly_income_rwf}
                />
                <MoneyField
                  label="Average daily takings"
                  value={form.average_daily_earnings_rwf}
                  onChange={(v) => set("average_daily_earnings_rwf", v)}
                  error={errors.average_daily_earnings_rwf}
                />
                <CheckField
                  className="md:col-span-2"
                  label="I have a bank account"
                  checked={form.has_bank_account}
                  onChange={(v) => set("has_bank_account", v)}
                />
                {form.has_bank_account && (
                  <>
                    <TextField
                      label="Bank name"
                      value={form.bank_name}
                      onChange={(v) => set("bank_name", v)}
                    />
                    <TextField
                      label="Bank account number"
                      value={form.bank_account_number}
                      onChange={(v) => set("bank_account_number", v)}
                    />
                  </>
                )}
                <CheckField
                  className="md:col-span-2"
                  label="I have an existing loan"
                  checked={form.has_existing_loan}
                  onChange={(v) => set("has_existing_loan", v)}
                />
                {form.has_existing_loan && (
                  <AreaField
                    className="md:col-span-2"
                    label="Existing loan details"
                    hint="Lender, balance left, and how you repay it."
                    value={form.existing_loan_details}
                    onChange={(v) => set("existing_loan_details", v)}
                  />
                )}
                <MoneyField
                  label="Deposit you can raise now"
                  hint="Minimum 500,000 RWF."
                  value={form.deposit_available_rwf}
                  onChange={(v) => set("deposit_available_rwf", v)}
                  error={errors.deposit_available_rwf}
                />
                <CheckField
                  label="I may need UZA Access top-up"
                  checked={form.needs_uza_access_support}
                  onChange={(v) => set("needs_uza_access_support", v)}
                />
                <ChoiceField
                  label="Preferred repayment term"
                  hint="34% for 1–3 years, 36% for 4–5 years."
                  value={form.preferred_term_years}
                  options={["1", "2", "3", "4", "5"]}
                  onChange={(v) => set("preferred_term_years", v)}
                />
                <ChoiceField
                  label="Preferred payment route"
                  value={form.preferred_financing}
                  options={["Bank financed", "Cash (3% discount)", "30/70 split (1.5% discount)"]}
                  onChange={(v) => set("preferred_financing", v)}
                />
              </Grid>
            )}

            {step === 4 && (
              <Grid>
                <ChoiceField
                  label="Marital status"
                  value={form.marital_status}
                  options={["Single", "Married", "Divorced", "Widowed"]}
                  onChange={(v) => set("marital_status", v)}
                  error={errors.marital_status}
                />
                {form.marital_status === "Married" && (
                  <TextField
                    label="Spouse full name"
                    value={form.spouse_name}
                    onChange={(v) => set("spouse_name", v)}
                  />
                )}
                <CheckField
                  className="md:col-span-2"
                  label="I belong to a taxi cooperative"
                  checked={form.is_cooperative_member}
                  onChange={(v) => set("is_cooperative_member", v)}
                />
                {form.is_cooperative_member && (
                  <TextField
                    label="Cooperative name"
                    value={form.cooperative_name}
                    onChange={(v) => set("cooperative_name", v)}
                  />
                )}
                <MoneyField
                  className="md:col-span-2"
                  label="Vehicle price you are targeting"
                  value={form.target_vehicle_price_rwf}
                  onChange={(v) => set("target_vehicle_price_rwf", v)}
                />
                <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4 text-sm md:col-span-2">
                  {deposit ? (
                    <>
                      <p className="font-medium">
                        Deposit needed: {formatRwf(deposit.amount)} (
                        {Math.round(deposit.percent * 100)}%)
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Or collateral above {formatRwf(deposit.collateralAmount)}.
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      10% deposit up to 25M RWF, 15% from 26M. Collateral over 30% of vehicle value.
                    </p>
                  )}
                </div>
                <CheckField
                  className="md:col-span-2"
                  label="I will pledge collateral instead of cash"
                  checked={form.offers_collateral}
                  onChange={(v) => set("offers_collateral", v)}
                />
                {form.offers_collateral && (
                  <>
                    <MoneyField
                      label="Estimated collateral value"
                      value={form.collateral_value_rwf}
                      onChange={(v) => set("collateral_value_rwf", v)}
                    />
                    <AreaField
                      className="md:col-span-2"
                      label="What is the collateral?"
                      hint="Land, house, or vehicle — include location or plate."
                      value={form.collateral_description}
                      onChange={(v) => set("collateral_description", v)}
                    />
                  </>
                )}
                <CheckField
                  className="md:col-span-2"
                  label="I am currently listed on CRB"
                  checked={form.listed_on_crb}
                  onChange={(v) => set("listed_on_crb", v)}
                />
                {form.listed_on_crb && (
                  <AreaField
                    className="md:col-span-2"
                    label="How are you resolving the CRB listing?"
                    value={form.crb_resolution_notes}
                    onChange={(v) => set("crb_resolution_notes", v)}
                  />
                )}
                {form.has_existing_loan && (
                  <>
                    <TextField
                      label="Other loan — which bank?"
                      value={form.other_loan_bank}
                      onChange={(v) => set("other_loan_bank", v)}
                    />
                    <TextField
                      label="Separate repayment source"
                      value={form.other_loan_repayment_source}
                      onChange={(v) => set("other_loan_repayment_source", v)}
                    />
                  </>
                )}
              </Grid>
            )}

            {step === 5 && (
              <Grid>
                <TextField
                  label="Next of kin name"
                  value={form.next_of_kin_name}
                  onChange={(v) => set("next_of_kin_name", v)}
                />
                <TextField
                  label="Next of kin phone"
                  inputMode="tel"
                  value={form.next_of_kin_phone}
                  onChange={(v) => set("next_of_kin_phone", v)}
                />
                <TextField
                  label="Relationship"
                  placeholder="e.g. spouse, brother"
                  value={form.next_of_kin_relationship}
                  onChange={(v) => set("next_of_kin_relationship", v)}
                />
                <TextField
                  label="Guarantor name"
                  value={form.guarantor_name}
                  onChange={(v) => set("guarantor_name", v)}
                />
                <TextField
                  label="Guarantor phone"
                  inputMode="tel"
                  value={form.guarantor_phone}
                  onChange={(v) => set("guarantor_phone", v)}
                />
                <TextField
                  label="Guarantor occupation"
                  value={form.guarantor_occupation}
                  onChange={(v) => set("guarantor_occupation", v)}
                />
                <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-4 text-sm text-muted-foreground md:col-span-2">
                  Submitting creates your permanent candidate ID for the rest of the programme.
                </div>
              </Grid>
            )}
                </div>

                <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-5 md:px-8">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{current.title}</span>
                    <span className="mx-2 text-border">·</span>
                    {step + 1}/{STEPS.length}
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto">
                    {step > 0 ? (
                      <Button type="button" variant="outline" onClick={goBack} disabled={busy}>
                        Back
                      </Button>
                    ) : (
                      <span className="hidden sm:block" />
                    )}
                    {isLast ? (
                      <Button
                        type="button"
                        onClick={submit}
                        disabled={busy}
                        className={step === 0 ? "col-span-2" : undefined}
                      >
                        {busy ? "Submitting…" : "Submit application"}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={goNext}
                        className={step === 0 ? "col-span-2" : undefined}
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

