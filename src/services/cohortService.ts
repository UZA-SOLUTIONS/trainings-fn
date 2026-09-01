import { api, type ApiResponse } from "./api";
import type { Candidate, CandidateSummary } from "./candidateService";

export type Cohort = {
  id: string;
  name: string;
  code: string;
  capacity: number;
  location: string | null;
  start_date: string | null;
  end_date?: string | null;
  applications_open: boolean;
  partner_bank: string | null;
  institution_id?: string | null;
  notes?: string | null;
};

export type CreateCohortPayload = {
  name: string;
  code: string;
  capacity?: number;
  location?: string | null;
  start_date?: string | null;
  partner_bank?: string | null;
  applications_open?: boolean;
  notes?: string | null;
};

export async function listCohorts(opts: { open?: boolean } = {}) {
  const params = opts.open ? { open: "true" } : undefined;
  const { data } = await api.get<ApiResponse<{ cohorts: Cohort[] }>>("/cohorts", {
    params,
  });
  return data.data.cohorts;
}

export async function getCohortOverview() {
  const { data } = await api.get<
    ApiResponse<{
      cohorts: Cohort[];
      candidates: CandidateSummary[];
    }>
  >("/cohorts/overview");
  return data.data;
}

export async function getCohort(id: string) {
  const { data } = await api.get<
    ApiResponse<{ cohort: Cohort; candidates: Candidate[] }>
  >(`/cohorts/${id}`);
  return data.data;
}

export async function createCohort(payload: CreateCohortPayload) {
  const { data } = await api.post<ApiResponse<{ cohort: Cohort }>>("/cohorts", payload);
  return data.data.cohort;
}

export async function updateCohort(id: string, payload: Partial<Cohort>) {
  const { data } = await api.patch<ApiResponse<{ cohort: Cohort }>>(`/cohorts/${id}`, payload);
  return data.data.cohort;
}
