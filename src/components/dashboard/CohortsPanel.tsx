import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  createCohort,
  deleteCohort,
  updateCohort,
  type Cohort,
  type CohortKind,
} from "@/services/cohortService";
import { listCourses } from "@/services/courseService";
import { useInstitutions } from "@/utils/institutions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

type Candidate = {
  cohort_id: string;
  status: string;
};

type Draft = {
  id?: string;
  name: string;
  code: string;
  capacity: string;
  location: string;
  start_date: string;
  end_date: string;
  institution_id: string;
  partner_bank: string;
  applications_open: boolean;
  kind: CohortKind;
  course_id: string;
  target_school_code: string;
};

const BLANK: Draft = {
  name: "",
  code: "",
  capacity: "30",
  location: "",
  start_date: "",
  end_date: "",
  institution_id: "",
  partner_bank: "",
  applications_open: true,
  kind: "uza",
  course_id: "",
  target_school_code: "",
};

export function CohortsPanel({
  cohorts,
  candidates,
}: {
  cohorts: Cohort[];
  candidates: Candidate[];
}) {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canWrite = can("cohorts.write");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Cohort | null>(null);
  const [kindFilter, setKindFilter] = useState<"all" | CohortKind>("all");
  const { data: banks = [] } = useInstitutions({ activeOnly: true });
  const { data: courses = [] } = useQuery({
    queryKey: ["courses", "active"],
    queryFn: () => listCourses({ active: true }),
  });

  const visible = useMemo(() => {
    if (kindFilter === "all") return cohorts;
    return cohorts.filter((c) => (c.kind ?? "uza") === kindFilter);
  }, [cohorts, kindFilter]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["manage-overview"] });
    queryClient.invalidateQueries({ queryKey: ["cohort-overview"] });
    queryClient.invalidateQueries({ queryKey: ["cohort"] });
  }

  const toggleOpen = useMutation({
    mutationFn: async ({ id, open }: { id: string; open: boolean }) => {
      await updateCohort(id, { applications_open: open });
    },
    onSuccess: () => {
      toast.success("Cohort updated");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: async (d: Draft) => {
      const isIntake = d.kind === "institution";
      const bank = banks.find((b) => b.id === d.institution_id);
      const payload = {
        name: d.name.trim(),
        code: d.code.trim(),
        capacity: Number(d.capacity) || 30,
        location: d.location.trim() || null,
        start_date: d.start_date || null,
        end_date: d.end_date || null,
        kind: d.kind,
        course_id: d.course_id || null,
        target_school_code: isIntake ? d.target_school_code.trim() || null : null,
        institution_id: isIntake ? null : d.institution_id || null,
        partner_bank: isIntake ? null : bank?.name || d.partner_bank.trim() || null,
        applications_open: isIntake ? false : d.applications_open,
      };
      if (d.id) return updateCohort(d.id, payload);
      return createCohort(payload);
    },
    onSuccess: (_data, d) => {
      toast.success(d.id ? "Cohort updated" : "Cohort created");
      setDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCohort,
    onSuccess: () => {
      toast.success("Cohort deleted");
      setPendingDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startEdit(c: Cohort) {
    setDraft({
      id: c.id,
      name: c.name,
      code: c.code,
      capacity: String(c.capacity),
      location: c.location ?? "",
      start_date: c.start_date ?? "",
      end_date: c.end_date ?? "",
      institution_id: c.institution_id ?? "",
      partner_bank: c.partner_bank ?? "",
      applications_open: c.applications_open,
      kind: c.kind ?? "uza",
      course_id: c.course_id ?? "",
      target_school_code: c.target_school_code ?? "",
    });
  }

  const isIntakeDraft = draft?.kind === "institution";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-muted-foreground">Training</p>
          <h1 className="mt-1 font-display text-4xl font-bold">Cohorts</h1>
        </div>
        {canWrite && (
          <Button type="button" onClick={() => setDraft({ ...BLANK })}>
            Add cohort
          </Button>
        )}
      </div>

      <div className="mt-6">
        <Select value={kindFilter} onValueChange={(v) => setKindFilter(v as "all" | CohortKind)}>
          <SelectTrigger className="w-[260px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All classes</SelectItem>
            <SelectItem value="uza">UZA classes</SelectItem>
            <SelectItem value="institution">Partner institution intakes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {draft && canWrite && (
        <Card className="mt-6 border-border/70 p-6">
          <h2 className="font-display text-xl font-semibold">
            {draft.id ? "Edit cohort" : "Create a cohort"}
          </h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(draft);
            }}
          >
            <div className="space-y-1.5">
              <Label>Kind</Label>
              <Select
                value={draft.kind}
                onValueChange={(value) => {
                  const kind = value as CohortKind;
                  setDraft({
                    ...draft,
                    kind,
                    applications_open: kind === "institution" ? false : draft.applications_open,
                    institution_id: kind === "institution" ? "" : draft.institution_id,
                    partner_bank: kind === "institution" ? "" : draft.partner_bank,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uza">UZA class</SelectItem>
                  <SelectItem value="institution">Partner institution intake</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
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
                value={draft.capacity}
                onChange={(e) => setDraft({ ...draft, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Start date</Label>
              <Input
                id="start_date"
                type="date"
                value={draft.start_date}
                onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end_date">End date</Label>
              <Input
                id="end_date"
                type="date"
                value={draft.end_date}
                onChange={(e) => setDraft({ ...draft, end_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select
                value={draft.course_id || "none"}
                onValueChange={(v) => setDraft({ ...draft, course_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No course</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isIntakeDraft ? (
              <div className="space-y-1.5">
                <Label htmlFor="target_school_code">School code (optional)</Label>
                <Input
                  id="target_school_code"
                  placeholder="Leave empty for every school"
                  value={draft.target_school_code}
                  onChange={(e) => setDraft({ ...draft, target_school_code: e.target.value })}
                />
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Partner bank</Label>
                  <Select
                    value={draft.institution_id || "none"}
                    onValueChange={(value) => {
                      if (value === "none") {
                        setDraft({ ...draft, institution_id: "", partner_bank: "" });
                        return;
                      }
                      const bank = banks.find((b) => b.id === value);
                      setDraft({
                        ...draft,
                        institution_id: value,
                        partner_bank: bank?.name ?? "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank partner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No bank linked</SelectItem>
                      {banks.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                          {b.bank_id ? ` · ${b.bank_id}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
                  <Switch
                    checked={draft.applications_open}
                    onCheckedChange={(v) => setDraft({ ...draft, applications_open: v })}
                    id="applications_open"
                  />
                  <Label htmlFor="applications_open">Applications open</Label>
                </div>
              </>
            )}
            <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : draft.id ? "Save changes" : "Create cohort"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-8 overflow-hidden border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cohort</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Partner bank</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Waiting</TableHead>
              <TableHead>Status</TableHead>
              {canWrite && <TableHead>Applications</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((c) => {
              const inCohort = candidates.filter((x) => x.cohort_id === c.id);
              const seated = inCohort.filter(
                (x) => x.status === "enrolled" || x.status === "graduated",
              ).length;
              const waiting = inCohort.filter((x) => x.status === "waitlisted").length;
              const pct = Math.min(100, Math.round((seated / c.capacity) * 100));
              const kind = c.kind ?? "uza";

              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.code}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={kind === "institution" ? "secondary" : "default"}>
                      {kind === "institution" ? "Partner intake" : "UZA class"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.course?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.location ?? "TBC"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.start_date ?? "TBC"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {kind === "institution" ? "—" : c.partner_bank ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[7rem]">
                      <p className="text-base font-medium">
                        {seated} / {c.capacity}
                      </p>
                      <Progress value={pct} className="mt-1.5 h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{waiting}</TableCell>
                  <TableCell>
                    <Badge variant={c.applications_open ? "default" : "secondary"}>
                      {c.applications_open ? "Open" : "Closed"}
                    </Badge>
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      {kind === "uza" ? (
                        <Switch
                          checked={c.applications_open}
                          onCheckedChange={(v) => toggleOpen.mutate({ id: c.id, open: v })}
                          aria-label={`Toggle applications for ${c.name}`}
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">Closed</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canWrite && (
                        <>
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(c)}>
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => setPendingDelete(c)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/cohorts/${c.id}`}>View</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {visible.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={canWrite ? 11 : 10}
                  className="py-8 text-center text-muted-foreground"
                >
                  No cohorts yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete cohort"
        description={pendingDelete ? `Delete cohort “${pendingDelete.name}”?` : ""}
        confirmLabel="Delete cohort"
        pending={deleteMutation.isPending}
        onConfirm={async () => {
          if (pendingDelete) await deleteMutation.mutateAsync(pendingDelete.id);
        }}
      />
    </div>
  );
}
