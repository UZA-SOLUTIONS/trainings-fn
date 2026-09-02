import { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listCohorts } from "@/services/cohortService";
import { listCandidates } from "@/services/candidateService";
import { listLenderFiles } from "@/services/lenderService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OverviewPanel } from "@/components/dashboard/OverviewPanel";
import { CohortsPanel } from "@/components/dashboard/CohortsPanel";
import { CandidatesPanel } from "@/components/dashboard/CandidatesPanel";
import { LenderFilesPanel } from "@/components/dashboard/LenderFilesPanel";
import { BanksPanel } from "@/components/dashboard/BanksPanel";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { isDashboardTab, type DashboardTab } from "@/components/dashboard/types";
import { useAuth } from "@/hooks/useAuth";
import { defaultTabForRole } from "@/lib/permissions";

const DATA_TABS: DashboardTab[] = ["overview", "cohorts", "candidates"];

export default function Dashboard() {
  const [params, setParams] = useSearchParams();
  const { user, canAccessTab, isBankPartner } = useAuth();
  const rawTab = params.get("tab");
  const tab: DashboardTab =
    rawTab === "profile" ? "settings" : isDashboardTab(rawTab) ? rawTab : "overview";
  const needsData = DATA_TABS.includes(tab);

  useEffect(() => {
    if (rawTab === "profile") {
      setParams({ tab: "settings" }, { replace: true });
      return;
    }
    if (!user) return;
    if (!canAccessTab(tab)) {
      const fallback = defaultTabForRole(user.role);
      setParams({ tab: fallback }, { replace: true });
    }
  }, [user, tab, rawTab, canAccessTab, setParams]);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["manage-overview", user?.role],
    queryFn: async () => {
      const cohorts = await listCohorts();
      if (user?.role === "bank_partner") {
        const files = await listLenderFiles();
        const candidates = files.map((f) => ({
          id: f.uzaId,
          cohort_id: "",
          status: "enrolled",
          training_status: f.trainingStatus,
          loan_review_status: f.loanReviewStatus,
          listed_on_crb: false,
          full_name: f.displayName,
          candidate_code: f.uzaId,
        }));
        return { cohorts, candidates, files };
      }
      const candidates = await listCandidates();
      return { cohorts, candidates, files: [] };
    },
    enabled: needsData && Boolean(user),
  });

  if (!user || !canAccessTab(tab)) {
    return <p className="text-base text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {needsData && isError && (
        <Card className="border-destructive/30 bg-destructive/5 p-5">
          <p className="text-base font-medium text-destructive">Could not load dashboard data</p>
          <p className="mt-1 text-base text-muted-foreground">
            {error instanceof Error ? error.message : "Request failed"}
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </Card>
      )}

      {needsData && isPending && (
        <p className="text-base text-muted-foreground">Loading…</p>
      )}

      {tab === "overview" && !isPending && !isError && data && (
        <OverviewPanel cohorts={data.cohorts} candidates={data.candidates} role={user.role} />
      )}

      {tab === "cohorts" && !isPending && !isError && data && (
        <CohortsPanel cohorts={data.cohorts} candidates={data.candidates} />
      )}

      {tab === "courses" && <Navigate to="/courses" replace />}

      {tab === "modules" && <Navigate to="/modules" replace />}

      {tab === "candidates" && isBankPartner && <LenderFilesPanel />}

      {tab === "candidates" && !isBankPartner && !isPending && !isError && data && (
        <CandidatesPanel cohorts={data.cohorts} candidates={data.candidates} />
      )}

      {tab === "banks" && <BanksPanel />}

      {tab === "settings" && <SettingsPanel />}
    </div>
  );
}
