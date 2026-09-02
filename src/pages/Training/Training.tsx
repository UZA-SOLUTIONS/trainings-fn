import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiArrowRight, FiMapPin, FiCalendar, FiClock, FiLayers } from "react-icons/fi";
import { listCohorts } from "@/services/cohortService";
import { listCourses } from "@/services/courseService";
import { listModules } from "@/services/moduleService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";

export default function Training() {
  const cohortsQuery = useQuery({
    queryKey: ["public-cohorts"],
    queryFn: () => listCohorts({ open: true }),
  });
  const coursesQuery = useQuery({
    queryKey: ["public-courses"],
    queryFn: () => listCourses({ active: true }),
  });
  const modulesQuery = useQuery({
    queryKey: ["public-modules"],
    queryFn: () => listModules({ active: true }),
  });

  const loading = cohortsQuery.isPending || coursesQuery.isPending || modulesQuery.isPending;
  const cohorts = cohortsQuery.data ?? [];
  const courses = coursesQuery.data ?? [];
  const modules = modulesQuery.data ?? [];

  return (
    <main className="bg-muted/25">
      <section className="border-b border-border/60 bg-background">
        <div className="container-page py-10 sm:py-14">
          <p className="text-eyebrow text-muted-foreground">Training programme</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Cohorts and modules for Tunga Taxi drivers
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            See open cohorts you can join, and the courses and modules covered before financing and
            vehicle allocation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/apply">Apply for training</Link>
            </Button>
            <Button asChild variant="outline">
              <a href="#modules">View modules</a>
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <LoadingSpinner label="Loading training…" />
        </div>
      ) : (
        <div className="container-page space-y-14 py-10 sm:py-14">
          <section id="cohorts">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-eyebrow text-muted-foreground">Open now</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  Cohorts
                </h2>
              </div>
              <Badge variant="secondary">{cohorts.length} open</Badge>
            </div>

            {cohortsQuery.isError ? (
              <Card className="mt-6 border-destructive/30 bg-destructive/5 p-5">
                <p className="font-medium text-destructive">Could not load cohorts</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {cohortsQuery.error instanceof Error
                    ? cohortsQuery.error.message
                    : "Request failed"}
                </p>
              </Card>
            ) : cohorts.length === 0 ? (
              <Card className="mt-6 border-border/70 p-6 text-muted-foreground">
                No cohorts are open for applications right now. Check back soon, or track an existing
                application with your UZA ID.
              </Card>
            ) : (
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {cohorts.map((c) => (
                  <li key={c.id}>
                    <Card className="flex h-full flex-col border-border/70 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display text-lg font-semibold">{c.name}</h3>
                          <p className="mt-1 font-mono text-sm text-muted-foreground">{c.code}</p>
                        </div>
                        <Badge>Applications open</Badge>
                      </div>
                      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <FiMapPin className="shrink-0" aria-hidden />
                          {c.location || "Location TBC"}
                        </li>
                        <li className="flex items-center gap-2">
                          <FiCalendar className="shrink-0" aria-hidden />
                          Starts {c.start_date || "TBC"}
                        </li>
                        <li className="flex items-center gap-2">
                          <FiLayers className="shrink-0" aria-hidden />
                          Capacity {c.capacity}
                          {c.partner_bank ? ` · ${c.partner_bank}` : ""}
                        </li>
                      </ul>
                      <div className="mt-6">
                        <Button asChild className="w-full sm:w-auto">
                          <Link to={`/apply?cohort=${c.id}`} className="inline-flex items-center gap-2">
                            Apply to this cohort
                            <FiArrowRight aria-hidden />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section id="modules">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-eyebrow text-muted-foreground">Curriculum</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                  Courses & modules
                </h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  What drivers cover during training, organised by course.
                </p>
              </div>
            </div>

            {(coursesQuery.isError || modulesQuery.isError) && (
              <Card className="mt-6 border-destructive/30 bg-destructive/5 p-5">
                <p className="font-medium text-destructive">Could not load curriculum</p>
              </Card>
            )}

            {!coursesQuery.isError && courses.length === 0 && (
              <Card className="mt-6 border-border/70 p-6 text-muted-foreground">
                Curriculum details will appear here once courses are published.
              </Card>
            )}

            <div className="mt-6 space-y-6">
              {courses.map((course) => {
                const courseModules = modules
                  .filter((m) => m.course_id === course.id)
                  .sort((a, b) => a.sort_order - b.sort_order);
                return (
                  <Card key={course.id} className="overflow-hidden border-border/70 p-0">
                    <div className="border-b border-border/60 px-5 py-5 sm:px-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl font-semibold">{course.name}</h3>
                          <p className="mt-1 font-mono text-sm text-muted-foreground">
                            {course.code}
                          </p>
                          {course.description && (
                            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
                              {course.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            {course.duration_weeks} week
                            {course.duration_weeks === 1 ? "" : "s"}
                          </Badge>
                          <Badge variant="outline">
                            {courseModules.length || course.module_count || 0} modules
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {courseModules.length === 0 ? (
                      <p className="px-5 py-5 text-sm text-muted-foreground sm:px-6">
                        Modules for this course will be listed soon.
                      </p>
                    ) : (
                      <ol className="divide-y divide-border/60">
                        {courseModules.map((m) => (
                          <li
                            key={m.id}
                            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="font-display text-sm font-semibold text-muted-foreground">
                                  {String(m.sort_order).padStart(2, "0")}
                                </span>
                                <h4 className="font-medium">{m.name}</h4>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {m.code}
                                </span>
                              </div>
                              {m.description && (
                                <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                              )}
                            </div>
                            <p className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                              <FiClock aria-hidden />
                              {m.duration_hours}h
                            </p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-background px-5 py-8 text-center sm:px-8">
            <h2 className="font-display text-2xl font-bold">Ready to join a cohort?</h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Apply with your details and choose an open cohort. You will receive a permanent UZA ID
              to track training and financing.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/apply">Apply for training</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/track">Track your ID</Link>
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
