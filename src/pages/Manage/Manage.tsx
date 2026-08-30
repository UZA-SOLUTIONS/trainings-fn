import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  listCohorts,
  createCohort,
  updateCohort,
  type Cohort,
} from "@/services/cohortService";
import { listCandidates } from "@/services/candidateService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Candidate = {
  id: string;
  cohort_id: string;
  status: string;
  training_status: string;
  needs_uza_access_support?: boolean;
  deposit_available_rwf?: number | null;
  has_bank_account?: boolean;
  doc_national_id?: boolean;
  doc_driving_license?: boolean;
  doc_passport_photo?: boolean;
  doc_criminal_record?: boolean;
  doc_proof_of_residence?: boolean;
  doc_bank_statement?: boolean;
  doc_medical_certificate?: boolean;
  [key: string]: unknown;
};

const DOC_KEYS = [
  "doc_national_id",
  "doc_driving_license",
  "doc_passport_photo",
  "doc_criminal_record",
  "doc_proof_of_residence",
  "doc_bank_statement",
  "doc_medical_certificate",
] as const;

function fmt(n: number) {
  return new Intl.NumberFormat("en-RW").format(Math.round(n));
}

export default function Manage() {
  const queryClient = useQueryClient();
  const { isAdmin, loading: authLoading } = useAuth();

  const { data, isPending } = useQuery({
    queryKey: ["manage-overview"],
    queryFn: async () => {
      const [cohorts, candidates] = await Promise.all([listCohorts(), listCandidates()]);
      return {
        cohorts: cohorts as Cohort[],
        candidates: candidates as Candidate[],
      };
    },
  });

  const toggleOpen = useMutation({
    mutationFn: async ({ id, open }: { id: string; open: boolean }) => {
      await updateCohort(id, { applications_open: open });
    },
    onSuccess: () => {
      toast.success("Cohort updated");
      queryClient.invalidateQueries({ queryKey: ["manage-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [form, setForm] = useState({
    name: "",
    code: "",
    capacity: "30",
    location: "",
    start_date: "",
    partner_bank: "Unguka Bank",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await createCohort({
        name: form.name,
        code: form.code,
        capacity: Number(form.capacity) || 30,
        location: form.location || null,
        start_date: form.start_date || null,
        partner_bank: form.partner_bank || null,
      });
    },
    onSuccess: () => {
      toast.success("Cohort created");
      setForm({
        name: "",
        code: "",
        capacity: "30",
        location: "",
        start_date: "",
        partner_bank: "Unguka Bank",
      });
      queryClient.invalidateQueries({ queryKey: ["manage-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const cohorts = data?.cohorts ?? [];
  const candidates = data?.candidates ?? [];

  const count = (s: string) => candidates.filter((c) => c.status === s).length;
  const capacity = cohorts.reduce((a, c) => a + c.capacity, 0);
  const enrolled = count("enrolled") + count("graduated");
  const docsComplete = candidates.filter((c) =>
    DOC_KEYS.every((k) => c[k] === true),
  ).length;
  const trainingDone = candidates.filter((c) => c.training_status === "completed").length;
  const accessSupport = candidates.filter((c) => c.needs_uza_access_support).length;
  const deposits = candidates
    .map((c) => Number(c.deposit_available_rwf ?? 0))
    .filter((n) => n > 0);
  const avgDeposit = deposits.length
    ? deposits.reduce((a, b) => a + b, 0) / deposits.length
    : 0;
  const banked = candidates.filter((c) => c.has_bank_account).length;

  return (
    <main className="container-page py-10">
      <p className="text-eyebrow text-muted-foreground">Management</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Programme overview</h1>
      <p className="mt-2 max-w-4xl text-muted-foreground">
        Capacity, the application funnel, document and financing readiness across every Tunga
        Taxi cohort.
      </p>

      {!authLoading && !isAdmin && (
        <p className="mt-6 rounded-md border border-border/70 bg-background p-4 text-sm text-muted-foreground">
          You are signed in as an instructor â€” this view is read-only. Only admins can create
          cohorts or open and close applications.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Applications", candidates.length],
          ["Seats filled", `${enrolled} / ${capacity}`],
          ["Waiting list", count("waitlisted")],
          ["Graduated", count("graduated")],
          ["Documents complete", docsComplete],
          ["Training completed", trainingDone],
          ["Need UZA Access top-up", accessSupport],
          ["With bank account", banked],
        ].map(([label, value]) => (
          <Card key={String(label)} className="border-border/70 p-5">
            <p className="text-eyebrow text-muted-foreground">{label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-border/70 p-5">
        <p className="text-eyebrow text-muted-foreground">Average deposit available</p>
        <p className="mt-1 font-display text-2xl font-bold">{fmt(avgDeposit)} RWF</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Minimum driver contribution is 500,000 RWF; UZA Access can top up the gap to the
          required 10%.
        </p>
      </Card>

      {isAdmin && (
        <Card className="mt-8 border-border/70 p-6">
          <h2 className="font-display text-lg font-semibold">Create a cohort</h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
          >
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
                maxLength={30}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Start date</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="partner_bank">Partner bank</Label>
              <Input
                id="partner_bank"
                value={form.partner_bank}
                onChange={(e) => setForm({ ...form, partner_bank: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creatingâ€¦" : "Create cohort"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <h2 className="mt-10 font-display text-lg font-semibold">Cohorts</h2>
      {isPending ? (
        <p className="mt-4 text-sm text-muted-foreground">Loadingâ€¦</p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {cohorts.map((c) => {
            const inCohort = candidates.filter((x) => x.cohort_id === c.id);
            const seated = inCohort.filter(
              (x) => x.status === "enrolled" || x.status === "graduated",
            ).length;
            const waiting = inCohort.filter((x) => x.status === "waitlisted").length;
            const pct = Math.min(100, Math.round((seated / c.capacity) * 100));
            return (
              <Card key={c.id} className="border-border/70 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-semibold">{c.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {c.code} Â· {c.location ?? "Location TBC"} Â· {c.start_date ?? "Start TBC"}
                    </p>
                  </div>
                  <Badge variant={c.applications_open ? "default" : "secondary"}>
                    {c.applications_open ? "Open" : "Closed"}
                  </Badge>
                </div>

                <div className="mt-5">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">
                      {seated} / {c.capacity} seats
                    </span>
                    <span className="text-muted-foreground">{waiting} waiting</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/cohorts/${c.id}`}>Candidates</Link>
                  </Button>
                  {isAdmin && (
                    <label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Switch
                        checked={c.applications_open}
                        onCheckedChange={(v) => toggleOpen.mutate({ id: c.id, open: v })}
                      />
                      Applications open
                    </label>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
