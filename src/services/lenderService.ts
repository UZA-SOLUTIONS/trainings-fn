import { api, type ApiResponse } from "./api";

export type LoanReviewStatus =
  | "not_ready"
  | "pending"
  | "in_review"
  | "approved"
  | "declined"
  | "more_info_needed";

export type LenderFileSummary = {
  uzaId: string;
  displayName: string;
  loanReviewStatus: LoanReviewStatus;
  trainingStatus: string;
};

export type LenderFile = {
  identity: {
    uzaId: string;
    displayName: string;
  };
  loanReview: {
    status: LoanReviewStatus;
    notes: string | null;
  };
  training?: {
    programme: string;
    completedDate: string | null;
    assessmentPassed: boolean;
  };
  creditEnhancement?: {
    pledged: boolean;
    released: boolean;
    callable: boolean;
  };
};

export type UpdateLenderFilePatch = {
  loan_review_status?: LoanReviewStatus;
  bank_notes?: string | null;
};

export async function listLenderFiles() {
  const { data } = await api.get<ApiResponse<{ files: LenderFileSummary[] }>>(
    "/financing/lenders/files",
  );
  return data.data.files;
}

export async function getLenderFile(code: string) {
  const normalized = code.trim().toUpperCase();
  const { data } = await api.get<ApiResponse<{ file: LenderFile }>>(
    `/financing/lenders/files/${encodeURIComponent(normalized)}`,
  );
  return data.data.file;
}

export async function updateLenderFile(code: string, patch: UpdateLenderFilePatch) {
  const normalized = code.trim().toUpperCase();
  const { data } = await api.patch<ApiResponse<{ file: LenderFile }>>(
    `/financing/lenders/files/${encodeURIComponent(normalized)}`,
    patch,
  );
  return data.data.file;
}

export const LENDER_REFUSAL_MESSAGE = "No file available for that reference.";
