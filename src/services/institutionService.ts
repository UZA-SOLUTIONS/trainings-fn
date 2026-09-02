import { api, type ApiResponse } from "./api";
import type { Institution } from "@/utils/institutions";

export type InstitutionPayload = Omit<Institution, "id" | "bank_id">;

export async function listInstitutions(opts: { activeOnly?: boolean } = {}) {
  const params =
    opts.activeOnly === false ? { activeOnly: "false" } : undefined;
  const { data } = await api.get<ApiResponse<{ institutions: Institution[] }>>(
    "/institutions",
    { params },
  );
  return data.data.institutions;
}

export async function createInstitution(payload: InstitutionPayload) {
  const { data } = await api.post<ApiResponse<{ institution: Institution }>>(
    "/institutions",
    payload,
  );
  return data.data.institution;
}

export async function updateInstitution(id: string, payload: Partial<InstitutionPayload>) {
  const { data } = await api.patch<ApiResponse<{ institution: Institution }>>(
    `/institutions/${id}`,
    payload,
  );
  return data.data.institution;
}

export async function deleteInstitution(id: string) {
  const { data } = await api.delete<ApiResponse<{ institution: Institution }>>(
    `/institutions/${id}`,
  );
  return data.data.institution;
}
