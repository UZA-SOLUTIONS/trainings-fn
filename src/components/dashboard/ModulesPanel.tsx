import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { listCourses } from "@/services/courseService";
import {
  createModule,
  deleteModule,
  listModules,
  updateModule,
  type ModuleStatus,
  type TrainingModule,
} from "@/services/moduleService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";

type Draft = {
  id?: string;
  course_id: string;
  name: string;
  code: string;
  description: string;
  sort_order: string;
  duration_hours: string;
  status: ModuleStatus;
};

const BLANK: Draft = {
  course_id: "",
  name: "",
  code: "",
  description: "",
  sort_order: "1",
  duration_hours: "4",
  status: "active",
};

function statusBadge(status: TrainingModule["status"]) {
  if (status === "active") return <Badge className="bg-primary/15 text-primary">Active</Badge>;
  if (status === "draft") return <Badge variant="secondary">Draft</Badge>;
  return <Badge variant="outline">Archived</Badge>;
}

export function ModulesPanel() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [draft, setDraft] = useState<Draft | null>(null);

  const {
    data: modules = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["modules"],
    queryFn: () => listModules(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });

  const saveMutation = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        course_id: d.course_id,
        name: d.name.trim(),
        code: d.code.trim(),
        description: d.description.trim() || null,
        sort_order: Number(d.sort_order) || 1,
        duration_hours: Number(d.duration_hours) || 0,
        status: d.status,
      };
      if (d.id) return updateModule(d.id, payload);
      return createModule(payload);
    },
    onSuccess: (_data, d) => {
      toast.success(d.id ? "Module updated" : "Module created");
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteModule,
    onSuccess: () => {
      toast.success("Module deleted");
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startEdit(mod: TrainingModule) {
    setDraft({
      id: mod.id,
      course_id: mod.course_id,
      name: mod.name,
      code: mod.code,
      description: mod.description ?? "",
      sort_order: String(mod.sort_order ?? 1),
      duration_hours: String(mod.duration_hours ?? 0),
      status: mod.status,
    });
  }

  function confirmDelete(mod: TrainingModule) {
    if (!window.confirm(`Delete module “${mod.name}”?`)) return;
    deleteMutation.mutate(mod.id);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-muted-foreground">Training</p>
          <h1 className="mt-1 font-display text-4xl font-bold">Modules</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Create, update, and manage modules delivered within each course.
          </p>
        </div>
        {isAdmin && (
          <Button type="button" onClick={() => setDraft({ ...BLANK })}>
            Add module
          </Button>
        )}
      </div>

      {draft && isAdmin && (
        <Card className="mt-6 border-border/70 p-6">
          <h2 className="font-display text-xl font-semibold">
            {draft.id ? "Edit module" : "Create a module"}
          </h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.course_id) {
                toast.error("Choose a course");
                return;
              }
              saveMutation.mutate(draft);
            }}
          >
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={draft.course_id || undefined}
                onValueChange={(value) => setDraft({ ...draft, course_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-name">Name</Label>
              <Input
                id="module-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-code">Code</Label>
              <Input
                id="module-code"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-order">Order</Label>
              <Input
                id="module-order"
                type="number"
                min={1}
                value={draft.sort_order}
                onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-hours">Duration (hours)</Label>
              <Input
                id="module-hours"
                type="number"
                min={0}
                value={draft.duration_hours}
                onChange={(e) => setDraft({ ...draft, duration_hours: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={draft.status}
                onValueChange={(value: ModuleStatus) => setDraft({ ...draft, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="module-desc">Description</Label>
              <Input
                id="module-desc"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : draft.id ? "Save changes" : "Create module"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-8 overflow-hidden border-border/70">
        {isError ? (
          <div className="p-6">
            <p className="font-medium text-destructive">Could not load modules</p>
            <p className="mt-1 text-muted-foreground">
              {error instanceof Error ? error.message : "Request failed"}
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-muted-foreground">
                    Loading modules…
                  </TableCell>
                </TableRow>
              )}
              {!isPending &&
                modules.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="tabular-nums text-muted-foreground">{m.sort_order}</TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium">{m.name}</p>
                        {m.description && (
                          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {m.course_name || "—"}
                      {m.course_code ? (
                        <span className="ml-1 font-mono text-xs">({m.course_code})</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{m.code}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {m.duration_hours}
                    </TableCell>
                    <TableCell>{statusBadge(m.status)}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(m)}>
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => confirmDelete(m)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              {!isPending && modules.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 7 : 6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No modules yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
