import { api, type ApiResponse } from "./api";

export type CandidateStatus =
  | "enrolled"
  | "waitlisted"
  | "rejected"
  | "withdrawn"
  | "graduated";

export type TrainingStatus = "not_started" | "in_progress" | "completed" | "failed";

export type LoanReviewStatus =
  | "not_ready"
  | "pending"
  | "in_review"
  | "approved"
  | "declined"
  | "more_info_needed";

export type Candidate = {
  id: string;
  candidate_code: string;
  cohort_id: string;
  status: CandidateStatus;
  waitlist_position: number | null;
  training_status: TrainingStatus;
  full_name: string;
  national_id: string;
  date_of_birth: string | null;
  gender: string | null;
  phone: string;
  email: string | null;
  district: string | null;
  sector: string;
  cell: string;
  education_level: string;
  preferred_language: string;
  has_smartphone: boolean;
  driving_license_number: string | null;
  license_categories: string;
  license_issue_date: string | null;
  years_driving_experience: number | null;
  taxi_association: string;
  current_vehicle_plate: string;
  currently_driving_for: string;
  previously_drove_for_service: boolean;
  monthly_income_rwf: number | null;
  average_daily_earnings_rwf: number | null;
  has_bank_account: boolean;
  bank_name: string;
  bank_account_number: string;
  has_existing_loan: boolean;
  existing_loan_details: string;
  deposit_available_rwf: number | null;
  needs_uza_access_support: boolean;
  preferred_term_years: number | null;
  preferred_financing: string | null;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  next_of_kin_relationship: string;
  guarantor_name: string;
  guarantor_phone: string;
  guarantor_occupation: string;
  marital_status: string | null;
  spouse_name: string;
  is_cooperative_member: boolean;
  cooperative_name: string;
  target_vehicle_price_rwf: number;
  offers_collateral: boolean;
  collateral_description: string;
  collateral_value_rwf: number;
  listed_on_crb: boolean;
  crb_resolution_notes: string;
  other_loan_bank: string;
  other_loan_repayment_source: string;
  loan_review_status: LoanReviewStatus;
  bank_notes: string | null;
  doc_national_id: boolean;
  doc_spouse_id: boolean;
  doc_loan_application_letter: boolean;
  doc_tax_clearance: boolean;
  doc_marital_status_proof: boolean;
  doc_proforma_invoice: boolean;
  doc_deposit_proof: boolean;
  doc_momo_statement: boolean;
  doc_yego_history: boolean;
  doc_cooperative_letter: boolean;
  doc_driving_license: boolean;
  doc_previous_vehicle_docs: boolean;
  doc_two_passport_photos: boolean;
  doc_passport_photo: boolean;
  doc_criminal_record: boolean;
  doc_proof_of_residence: boolean;
  doc_bank_statement: boolean;
  doc_medical_certificate: boolean;
  attendance_percentage: number | null;
  exam_score: number | null;
  instructor_notes: string | null;
  disqualification_reason: string | null;
  applied_at: string;
};

export type ApplicationPayload = Record<string, unknown>;

export type CandidateSummary = Pick<
  Candidate,
  "id" | "cohort_id" | "status" | "training_status" | "loan_review_status" | "listed_on_crb"
>;

export type UpdateCandidatePatch = Partial<
  Pick<
    Candidate,
    | "status"
    | "training_status"
    | "instructor_notes"
    | "attendance_percentage"
    | "exam_score"
    | "disqualification_reason"
    | "crb_resolution_notes"
    | "loan_review_status"
    | "bank_notes"
    | "doc_national_id"
    | "doc_spouse_id"
    | "doc_loan_application_letter"
    | "doc_tax_clearance"
    | "doc_marital_status_proof"
    | "doc_proforma_invoice"
    | "doc_deposit_proof"
    | "doc_momo_statement"
    | "doc_yego_history"
    | "doc_cooperative_letter"
    | "doc_driving_license"
    | "doc_previous_vehicle_docs"
    | "doc_two_passport_photos"
    | "doc_passport_photo"
    | "doc_criminal_record"
    | "doc_proof_of_residence"
    | "doc_bank_statement"
    | "doc_medical_certificate"
  >
>;

export async function submitApplication(payload: ApplicationPayload) {
  const { data } = await api.post<
    ApiResponse<{
      candidate: Pick<
        Candidate,
        "id" | "candidate_code" | "status" | "waitlist_position"
      >;
    }>
  >("/candidates", payload);
  return data.data.candidate;
}

export async function listCandidates(cohortId?: string) {
  const { data } = await api.get<ApiResponse<{ candidates: Candidate[] }>>("/candidates", {
    params: cohortId ? { cohortId } : undefined,
  });
  return data.data.candidates;
}

export async function updateCandidate(id: string, patch: UpdateCandidatePatch) {
  const { data } = await api.patch<ApiResponse<{ candidate: Candidate }>>(
    `/candidates/${id}`,
    patch,
  );
  return data.data.candidate;
}

export type TrackMilestoneStatus =
  | "complete"
  | "in_progress"
  | "pending"
  | "in_review"
  | "action_required"
  | "blocked";

export type CandidateTrackView = {
  candidate_code: string;
  full_name: string;
  status: CandidateStatus;
  waitlist_position: number | null;
  applied_at: string;
  phone: string;
  district: string | null;
  cohort: {
    name: string;
    code: string;
    location: string | null;
    start_date: string | null;
    partner_bank: string | null;
  } | null;
  training: {
    status: TrainingStatus;
    attendance_percentage: number | null;
    exam_score: number | null;
  };
  documents: Array<{
    key: string;
    label: string;
    required: boolean;
    optional_later: boolean;
    complete: boolean;
  }>;
  documents_summary: {
    complete: number;
    required: number;
    percent: number;
  };
  financing: {
    preferred_financing: string | null;
    preferred_term_years: number | null;
    target_vehicle_price_rwf: number;
    deposit_available_rwf: number | null;
    deposit_required_rwf: number | null;
    deposit_required_percent: number | null;
    needs_uza_access_support: boolean;
    offers_collateral: boolean;
    collateral_value_rwf: number;
    has_bank_account: boolean;
    listed_on_crb: boolean;
  };
  milestones: Array<{
    id: string;
    label: string;
    status: TrackMilestoneStatus;
  }>;
  current_stage: string;
  approvals: Array<{
    type: string;
    label: string;
    status: TrackMilestoneStatus;
    detail: string;
  }>;
};

export async function trackCandidate(code: string) {
  const normalized = code.trim().toUpperCase();
  const { data } = await api.get<ApiResponse<{ track: CandidateTrackView }>>(
    `/candidates/track/${encodeURIComponent(normalized)}`,
  );
  return data.data.track;
}
