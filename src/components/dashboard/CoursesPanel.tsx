import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { createCourse, listCourses, type Course } from "@/services/courseService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

function statusBadge(status: Course["status"]) {
  if (status === "active") return <Badge className="bg-primary/15 text-primary">Active</Badge>;
  if (status === "draft") return <Badge variant="secondary">Draft</Badge>;
  return <Badge variant="outline">Archived</Badge>;
}

export function CoursesPanel() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { data: courses = [], isPending, isError, error, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: listCourses,
  });

  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    duration_weeks: "4",
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await createCourse({
        name: form.name,
        code: form.code,
        description: form.description || null,
        duration_weeks: Number(form.duration_weeks) || 4,
        status: "active",
      });
    },
    onSuccess: () => {
      toast.success("Course created");
      setForm({ name: "", code: "", description: "", duration_weeks: "4" });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["modules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <p className="text-eyebrow text-muted-foreground">Training</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Courses</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Training courses available in the programme. Instructors can review the full course list.
      </p>

      {isAdmin && (
        <Card className="mt-8 border-border/70 p-6">
          <h2 className="font-display text-xl font-semibold">Create a course</h2>
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="course-name">Name</Label>
              <Input
                id="course-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-code">Code</Label>
              <Input
                id="course-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-weeks">Duration (weeks)</Label>
              <Input
                id="course-weeks"
                type="number"
                min={1}
                value={form.duration_weeks}
                onChange={(e) => setForm((f) => ({ ...f, duration_weeks: e.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-4">
              <Label htmlFor="course-desc">Description</Label>
              <Input
                id="course-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create course"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-8 overflow-hidden border-border/70">
        {isError ? (
          <div className="p-6">
            <p className="font-medium text-destructive">Could not load courses</p>
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
                <TableHead>Course</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    Loading courses…
                  </TableCell>
                </TableRow>
              )}
              {!isPending &&
                courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium">{c.name}</p>
                        {c.description && (
                          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                            {c.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{c.code}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.duration_weeks} week{c.duration_weeks === 1 ? "" : "s"}
                    </TableCell>
                    <TableCell className="tabular-nums">{c.module_count ?? 0}</TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                  </TableRow>
                ))}
              {!isPending && courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No courses yet.
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
