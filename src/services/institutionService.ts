import { api, type ApiResponse } from "./api";

export async function listInstitutions(opts: { activeOnly?: boolean } = {}) {
  const params =
    opts.activeOnly === false ? { activeOnly: "false" } : undefined;
  const { data } = await api.get<ApiResponse<{ institutions: Record<string, unknown>[] }>>(
    "/institutions",
    { params },
  );
  return data.data.institutions;
}

export async function createInstitution(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiResponse<{ institution: Record<string, unknown> }>>(
    "/institutions",
    payload,
  );
  return data.data.institution;
}

export async function updateInstitution(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch<ApiResponse<{ institution: Record<string, unknown> }>>(
    `/institutions/${id}`,
    payload,
  );
  return data.data.institution;
}
