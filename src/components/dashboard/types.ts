export type DashboardTab =
  | "overview"
  | "cohorts"
  | "candidates"
  | "banks"
  | "profile"
  | "settings";

export const DASHBOARD_TABS: { id: DashboardTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "cohorts", label: "Cohorts" },
  { id: "candidates", label: "Candidates" },
  { id: "banks", label: "Banks" },
  { id: "profile", label: "Profile" },
  { id: "settings", label: "Settings" },
];

export function isDashboardTab(value: string | null): value is DashboardTab {
  return (
    value === "overview" ||
    value === "cohorts" ||
    value === "candidates" ||
    value === "banks" ||
    value === "profile" ||
    value === "settings"
  );
}

export function dashboardTabFromPath(pathname: string, search: string): DashboardTab {
  if (pathname.startsWith("/cohorts")) return "candidates";
  const raw = new URLSearchParams(search).get("tab");
  return isDashboardTab(raw) ? raw : "overview";
}
