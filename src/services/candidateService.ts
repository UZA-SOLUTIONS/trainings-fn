import { api, type ApiResponse } from "./api";

export async function submitApplication(payload: Record<string, unknown>) {
  const { data } = await api.post<
    ApiResponse<{
      candidate: {
        id: string;
        candidate_code: string;
        status: string;
        waitlist_position: number | null;
      };
    }>
  >("/candidates", payload);
  return data.data.candidate;
}

export async function listCandidates(cohortId?: string) {
  const { data } = await api.get<ApiResponse<{ candidates: Record<string, unknown>[] }>>(
    "/candidates",
    { params: cohortId ? { cohortId } : undefined },
  );
  return data.data.candidates;
}

export async function updateCandidate(id: string, patch: Record<string, unknown>) {
  const { data } = await api.patch<ApiResponse<{ candidate: Record<string, unknown> }>>(
    `/candidates/${id}`,
    patch,
  );
  return data.data.candidate;
}
