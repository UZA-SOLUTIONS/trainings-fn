import type { DashboardTab } from "./types";

export type DashboardPreferences = {
  defaultTab: DashboardTab;
  emailNotifications: boolean;
};

const PREFS_KEY = "uza_dashboard_prefs";

const DEFAULT_PREFS: DashboardPreferences = {
  defaultTab: "overview",
  emailNotifications: true,
};

export function loadDashboardPreferences(): DashboardPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<DashboardPreferences>;
    return {
      defaultTab: parsed.defaultTab ?? DEFAULT_PREFS.defaultTab,
      emailNotifications: parsed.emailNotifications ?? DEFAULT_PREFS.emailNotifications,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveDashboardPreferences(prefs: DashboardPreferences) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}
