import { api, type ApiResponse } from "./api";

export type ModuleStatus = "draft" | "active" | "archived";

export type TrainingModule = {
  id: string;
  course_id: string;
  course_name?: string;
  course_code?: string;
  name: string;
  code: string;
  description: string | null;
  sort_order: number;
  duration_hours: number;
  status: ModuleStatus;
};

export type CreateModulePayload = {
  course_id: string;
  name: string;
  code: string;
  description?: string | null;
  sort_order?: number;
  duration_hours?: number;
  status?: ModuleStatus;
};

export async function listModules(opts: { courseId?: string; active?: boolean } = {}) {
  const params: Record<string, string> = {};
  if (opts.courseId) params.course_id = opts.courseId;
  if (opts.active) params.active = "true";
  const { data } = await api.get<ApiResponse<{ modules: TrainingModule[] }>>("/modules", {
    params: Object.keys(params).length ? params : undefined,
  });
  return data.data.modules;
}

export async function createModule(payload: CreateModulePayload) {
  const { data } = await api.post<ApiResponse<{ module: TrainingModule }>>("/modules", payload);
  return data.data.module;
}

export async function updateModule(id: string, payload: Partial<CreateModulePayload>) {
  const { data } = await api.patch<ApiResponse<{ module: TrainingModule }>>(
    `/modules/${id}`,
    payload,
  );
  return data.data.module;
}

export async function deleteModule(id: string) {
  const { data } = await api.delete<ApiResponse<{ module: TrainingModule }>>(`/modules/${id}`);
  return data.data.module;
}
