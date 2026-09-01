import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  createCohort,
  updateCohort,
  type Cohort,
} from "@/services/cohortService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
type Candidate = {
  cohort_id: string;
  status: string;
};

export function CohortsPanel({
  cohorts,
  candidates,
}: {
  cohorts: Cohort[];
  candidates: Candidate[];
}) {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const toggleOpen = useMutation({
    mutationFn: async ({ id, open }: { id: string; open: boolean }) => {
      await updateCohort(id, { applications_open: open });
    },
    onSuccess: () => {
      toast.success("Cohort updated");
      queryClient.invalidateQueries({ queryKey: ["manage-overview"] });
      queryClient.invalidateQueries({ queryKey: ["cohort-overview"] });
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
      queryClient.invalidateQueries({ queryKey: ["cohort-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <p className="text-eyebrow text-muted-foreground">Training</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Cohorts</h1>

      {isAdmin && (
        <Card className="mt-8 border-border/70 p-6">
          <h2 className="font-display text-xl font-semibold">Create a cohort</h2>
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
                {createMutation.isPending ? "Creating…" : "Create cohort"}
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
              <TableHead>Location</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>Partner bank</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Waiting</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead>Applications</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cohorts.map((c) => {
              const inCohort = candidates.filter((x) => x.cohort_id === c.id);
              const seated = inCohort.filter(
                (x) => x.status === "enrolled" || x.status === "graduated",
              ).length;
              const waiting = inCohort.filter((x) => x.status === "waitlisted").length;
              const pct = Math.min(100, Math.round((seated / c.capacity) * 100));

              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-muted-foreground">{c.code}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.location ?? "TBC"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.start_date ?? "TBC"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.partner_bank ?? "—"}
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
                  {isAdmin && (
                    <TableCell>
                      <Switch
                        checked={c.applications_open}
                        onCheckedChange={(v) => toggleOpen.mutate({ id: c.id, open: v })}
                        aria-label={`Toggle applications for ${c.name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/cohorts/${c.id}`}>View candidates</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {cohorts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={isAdmin ? 9 : 8}
                  className="py-8 text-center text-muted-foreground"
                >
                  No cohorts yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>    </div>
  );
}
