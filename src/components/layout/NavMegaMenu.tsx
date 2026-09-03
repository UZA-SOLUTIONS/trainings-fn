import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiChevronRight, FiMapPin } from "react-icons/fi";
import type { NavMegaItem, NavMegaMenuConfig } from "@/content/navMegaMenus";
import { listCohorts } from "@/services/cohortService";
import { listCourses } from "@/services/courseService";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { cn } from "@/lib/utils";

const ITEM_IMAGES = ["/1.jpg", "/bg.jpg", "/ev.avif", "/hero.avif"] as const;

function MenuRow({
  item,
  selected,
  onSelect,
}: {
  item: NavMegaItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onMouseEnter={onSelect}
        onFocus={onSelect}
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col items-start gap-0.5 px-5 py-3.5 text-left transition-colors sm:px-6",
          selected
            ? "bg-volt text-volt-foreground"
            : "text-foreground hover:bg-muted/70",
        )}
      >
        <span className="font-display text-sm font-semibold tracking-tight sm:text-[0.95rem]">
          {item.label}
        </span>
        {item.meta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs",
              selected ? "text-volt-foreground/80" : "text-muted-foreground",
            )}
          >
            <FiMapPin className="size-3 shrink-0" aria-hidden />
            {item.meta}
          </span>
        )}
      </button>
    </li>
  );
}

export function NavMegaMenu({
  open,
  onClose,
  onKeepOpen,
  config,
  /** Floating card under a transparent nav; flush sheet under a solid nav. */
  variant = "attach",
}: {
  open: boolean;
  onClose: () => void;
  onKeepOpen?: () => void;
  config: NavMegaMenuConfig;
  variant?: "float" | "attach";
}) {
  const [activeId, setActiveId] = useState(config.items[0]?.id ?? "");
  const floating = variant === "float";
  const isTraining = config.id === "training";
  const titleId = `${config.id}-mega-title`;

  const cohortsQuery = useQuery({
    queryKey: ["nav-open-cohorts"],
    queryFn: () => listCohorts({ open: true }),
    enabled: open && isTraining,
  });

  const coursesQuery = useQuery({
    queryKey: ["nav-active-courses"],
    queryFn: () => listCourses({ active: true }),
    enabled: open && isTraining,
  });

  const cohortItems = useMemo<NavMegaItem[]>(() => {
    if (!isTraining) return [];
    return (cohortsQuery.data ?? []).map((c, i) => ({
      id: `cohort-${c.id}`,
      label: c.name,
      title: c.name,
      description: c.location
        ? `Open cohort ${c.code} in ${c.location}. Apply now to reserve your place and begin the path to a verified training record.`
        : `Open cohort ${c.code}. Apply now to reserve your place and begin the path to a verified training record.`,
      cta: "Apply to this cohort",
      to: `/apply?cohort=${encodeURIComponent(c.id)}`,
      image: ITEM_IMAGES[i % ITEM_IMAGES.length],
      meta: c.location ? `${c.code} · ${c.location}` : c.code,
    }));
  }, [isTraining, cohortsQuery.data]);

  const courseItems = useMemo<NavMegaItem[]>(() => {
    if (!isTraining) return [];
    return (coursesQuery.data ?? []).map((c, i) => ({
      id: `course-${c.id}`,
      label: c.name,
      title: c.name,
      description: c.description?.trim()
        ? c.description
        : `Active course ${c.code}${c.duration_weeks ? ` · ${c.duration_weeks} weeks` : ""}. Apply for training to join a cohort that covers this course.`,
      cta: "Apply for training",
      to: "/apply",
      image: ITEM_IMAGES[(i + 2) % ITEM_IMAGES.length],
      meta: c.duration_weeks
        ? `${c.code} · ${c.duration_weeks} weeks`
        : c.code,
    }));
  }, [isTraining, coursesQuery.data]);

  const items = useMemo(() => {
    if (isTraining) return [...cohortItems, ...courseItems];
    return config.items;
  }, [isTraining, cohortItems, courseItems, config.items]);

  const active = items.find((item) => item.id === activeId) ?? items[0];
  const trainingLoading =
    isTraining && (cohortsQuery.isPending || coursesQuery.isPending);
  const trainingEmpty =
    isTraining && !trainingLoading && items.length === 0;

  useEffect(() => {
    if (!open) return;
    if (isTraining) {
      if (items[0]) setActiveId(items[0].id);
      return;
    }
    setActiveId(config.items[0]?.id ?? "");
  }, [open, config, isTraining, items]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label={`Close ${config.label}`}
        className={cn(
          "fixed inset-0 z-40 transition-colors",
          floating ? "bg-ink/50" : "bg-ink/35",
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "absolute inset-x-0 top-full z-50",
          floating ? "px-3 sm:px-5 md:px-8" : "px-0",
        )}
        onMouseEnter={onKeepOpen}
        onMouseLeave={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "overflow-hidden bg-background animate-in fade-in slide-in-from-top-1 duration-200",
            floating ? "mx-auto max-w-6xl shadow-lift" : "shadow-soft",
          )}
        >
          <div className="grid min-h-[min(68vh,30rem)] lg:grid-cols-[minmax(13.5rem,22%)_minmax(0,1fr)_minmax(13rem,30%)]">
            <nav aria-label={`${config.label} sections`} className="bg-card">
              <ul className="flex max-h-[38vh] flex-col overflow-y-auto lg:max-h-[min(68vh,30rem)]">
                {!isTraining &&
                  config.items.map((item) => (
                    <MenuRow
                      key={item.id}
                      item={item}
                      selected={activeId === item.id}
                      onSelect={() => setActiveId(item.id)}
                    />
                  ))}

                {isTraining && trainingLoading && (
                  <li className="flex justify-center py-10">
                    <LoadingSpinner label="Loading…" />
                  </li>
                )}

                {isTraining && !trainingLoading && cohortItems.length > 0 && (
                  <>
                    {cohortItems.map((item) => (
                      <MenuRow
                        key={item.id}
                        item={item}
                        selected={activeId === item.id}
                        onSelect={() => setActiveId(item.id)}
                      />
                    ))}
                  </>
                )}

                {isTraining && !trainingLoading && courseItems.length > 0 && (
                  <>
                    {courseItems.map((item) => (
                      <MenuRow
                        key={item.id}
                        item={item}
                        selected={activeId === item.id}
                        onSelect={() => setActiveId(item.id)}
                      />
                    ))}
                  </>
                )}

                {trainingEmpty && (
                  <li className="px-5 py-8 text-sm text-muted-foreground sm:px-6">
                    No open cohorts or courses right now.
                  </li>
                )}
              </ul>
            </nav>

            <div className="flex flex-col justify-between gap-8 bg-background px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
              {trainingLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <LoadingSpinner label="Loading…" />
                </div>
              ) : trainingEmpty ? (
                <div>
                  <p className="text-eyebrow text-muted-foreground">{config.eyebrow}</p>
                  <h2
                    id={titleId}
                    className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                  >
                    Nothing open yet
                  </h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Check back soon for open cohorts and active courses, or start an application.
                  </p>
                  <Link
                    to="/apply"
                    onClick={onClose}
                    className="group mt-8 inline-flex w-fit items-center gap-2 font-display text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                  >
                    Apply for training
                    <FiChevronRight
                      className="size-4 text-primary transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </div>
              ) : active ? (
                <>
                  <div key={active.id} className="animate-in fade-in duration-200">
                    <p className="text-eyebrow text-muted-foreground">{config.eyebrow}</p>
                    <h2
                      id={titleId}
                      className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl md:text-4xl"
                    >
                      {active.title}
                    </h2>
                    {active.meta && (
                      <p className="mt-2 font-mono text-xs text-muted-foreground">{active.meta}</p>
                    )}
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {active.description}
                    </p>
                  </div>

                  <Link
                    to={active.to}
                    onClick={onClose}
                    className="group inline-flex w-fit items-center gap-2 font-display text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                  >
                    {active.cta}
                    <FiChevronRight
                      className="size-4 text-primary transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                </>
              ) : null}
            </div>

            <div className="relative hidden min-h-[14rem] bg-muted lg:block">
              {active?.image && (
                <img
                  key={active.image + active.id}
                  src={active.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-300"
                />
              )}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
