export type DashboardTab =
  | "overview"
  | "cohorts"
  | "courses"
  | "modules"
  | "candidates"
  | "banks"
  | "settings";

export const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "cohorts", label: "Cohorts" },
  { id: "courses", label: "Courses" },
  { id: "modules", label: "Modules" },
  { id: "candidates", label: "Candidates" },
  { id: "banks", label: "Banks" },
  { id: "settings", label: "Settings" },
];

export function isDashboardTab(value: string | null): value is DashboardTab {
  return (
    value === "overview" ||
    value === "cohorts" ||
    value === "courses" ||
    value === "modules" ||
    value === "candidates" ||
    value === "banks" ||
    value === "settings"
  );
}

export function dashboardTabFromPath(pathname: string, search: string): DashboardTab {
  if (pathname.startsWith("/courses")) return "courses";
  if (pathname.startsWith("/modules")) return "modules";
  if (pathname.startsWith("/cohorts")) return "candidates";
  const raw = new URLSearchParams(search).get("tab");
  if (raw === "profile") return "settings";
  return isDashboardTab(raw) ? raw : "overview";
}
