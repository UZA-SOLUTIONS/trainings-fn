import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { listCourses } from "@/services/courseService";
import { createModule, listModules, type TrainingModule } from "@/services/moduleService";
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

function statusBadge(status: TrainingModule["status"]) {
  if (status === "active") return <Badge className="bg-primary/15 text-primary">Active</Badge>;
  if (status === "draft") return <Badge variant="secondary">Draft</Badge>;
  return <Badge variant="outline">Archived</Badge>;
}

export function ModulesPanel() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

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
    enabled: isAdmin,
  });

  const [form, setForm] = useState({
    course_id: "",
    name: "",
    code: "",
    description: "",
    sort_order: "1",
    duration_hours: "4",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await createModule({
        course_id: form.course_id,
        name: form.name,
        code: form.code,
        description: form.description || null,
        sort_order: Number(form.sort_order) || 1,
        duration_hours: Number(form.duration_hours) || 0,
        status: "active",
      });
    },
    onSuccess: () => {
      toast.success("Module created");
      setForm({
        course_id: form.course_id,
        name: "",
        code: "",
        description: "",
        sort_order: "1",
        duration_hours: "4",
      });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <p className="text-eyebrow text-muted-foreground">Training</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Modules</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Course modules instructors deliver during training. Review order, duration, and course
        assignment.
      </p>

      {isAdmin && (
        <Card className="mt-8 border-border/70 p-6">
          <h2 className="font-display text-xl font-semibold">Create a module</h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.course_id) {
                toast.error("Choose a course");
                return;
              }
              createMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={form.course_id || undefined}
                onValueChange={(value) => setForm((f) => ({ ...f, course_id: value }))}
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
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-code">Code</Label>
              <Input
                id="module-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-order">Order</Label>
              <Input
                id="module-order"
                type="number"
                min={1}
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-hours">Duration (hours)</Label>
              <Input
                id="module-hours"
                type="number"
                min={0}
                value={form.duration_hours}
                onChange={(e) => setForm((f) => ({ ...f, duration_hours: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="module-desc">Description</Label>
              <Input
                id="module-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create module"}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
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
                  </TableRow>
                ))}
              {!isPending && modules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
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
