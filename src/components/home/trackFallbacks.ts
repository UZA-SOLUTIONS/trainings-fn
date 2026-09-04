import type { CandidateTrackView } from "@/services/candidateService";
import type { WalletPreview } from "@/components/home/WalletUsagePanel";
import type { GaragePreview } from "@/components/home/GarageHealthPanel";

/** Wallet block for track when API has not attached one yet (all app numbers / balances = 0). */
export function fallbackWallet(track: CandidateTrackView): WalletPreview {
  const contribution = track.financing.deposit_available_rwf ?? 0;
  const selling = 22_500_000;
  const bankDeposit = Math.round(selling * 0.1);
  const accessGap = Math.max(0, bankDeposit - contribution);
  const loanPrincipal = Math.max(0, selling - contribution);

  return {
    status: "planned",
    live: false,
    message: "",
    uza_id: track.candidate_code,
    audience: "driver",
    app_numbers: {
      momo: "0",
      airtel: "0",
      uza_wallet: "0",
      linked_phone: track.phone || "0",
    },
    balances: {
      available_rwf: 0,
      savings_locked_rwf: 0,
      commission_owed_rwf: 0,
      currency: "RWF",
      endpoint: "GET /api/wallet/:uzaId",
    },
    daily: {
      source: "awaiting_trips",
      live: false,
      gross_rwf: 0,
      uza_commission_rwf: 0,
      driver_fare_share_rwf: 0,
      vehicle_owner_due_rwf: null,
      loan_instalment_rwf: null,
      savings_rwf: null,
      yours_to_keep_rwf: null,
      split: { driver_percent: 92, uza_percent: 8 },
      endpoint: "GET /api/wallet/:uzaId/daily",
    },
    savings: {
      live: false,
      mode: null,
      streak_days: 0,
      pot_rwf: 0,
      pays_loan_instalment: true,
      endpoint: "GET /api/wallet/:uzaId/savings",
    },
    loan: {
      live: false,
      days_ahead: null,
      days_behind: null,
      principal_rwf: loanPrincipal,
      term_months: (track.financing.preferred_term_years || 4) * 12,
      endpoint: "GET /api/wallet/:uzaId/loan",
    },
    financing: {
      selling_price_rwf: selling,
      target_vehicle_name: track.financing.target_vehicle_name,
      driver_contribution_rwf: contribution,
      bank_deposit_required_rwf: bankDeposit,
      bank_deposit_percent: 0.1,
      min_driver_contribution_rwf: 500_000,
      uza_access_gap_rwf: accessGap,
      uza_access_active: accessGap > 0 || track.financing.needs_uza_access_support,
      package_total_rwf: selling,
      loan_principal_rwf: loanPrincipal,
      identity_holds: true,
      term_months: (track.financing.preferred_term_years || 4) * 12,
      collateral_release_month: 24,
      note: "Bank always sees a full 10% deposit.",
    },
    bank_signals: {
      sees_full_ten_percent_deposit: true,
      deposit_cover_percent: bankDeposit
        ? Math.min(100, Math.round((contribution / bankDeposit) * 100))
        : 0,
      min_contribution_met: contribution >= 500_000,
      training_stands_in_for_equity: track.training.status === "completed",
      repayment_rail: "MTN MoMo / Airtel — confirmed network only",
      trust_score: null,
      trust_endpoint: "GET /api/trust/:uzaId",
      risk_endpoint: "GET /api/bank/applicants/:uzaId/wallet-risk",
    },
    endpoints: [],
  };
}

/** Garage block for track when API has not attached one yet (health numbers = 0). */
export function fallbackGarage(track: CandidateTrackView): GaragePreview {
  return {
    status: "awaiting_garage",
    live: false,
    message:
      "Garage link is ready. Car health and updates will appear here once the garage posts telemetry.",
    uza_id: track.candidate_code,
    vehicle: {
      plate: "",
      vin: "",
      model: track.financing.target_vehicle_name || "",
      garage_id: "",
      garage_name: "",
    },
    health: {
      overall_score: 0,
      battery_percent: 0,
      range_km: 0,
      odometer_km: 0,
      tyre_health_percent: 0,
      last_service_at: null,
      next_service_due_km: 0,
      status: "unknown",
    },
    updates: [],
    last_synced_at: null,
    endpoints: [
      {
        method: "POST",
        path: "/api/garage/:uzaId/updates",
        audience: ["garage", "staff"],
        purpose: "Ingest car health metrics and service updates from the garage",
      },
    ],
  };
}

export function resolveTrackWallet(track: CandidateTrackView): WalletPreview {
  const w = track.wallet;
  const base = fallbackWallet(track);
  if (!w) return base;
  return {
    ...base,
    ...w,
    app_numbers: {
      momo: w.app_numbers?.momo ?? "0",
      airtel: w.app_numbers?.airtel ?? "0",
      uza_wallet: w.app_numbers?.uza_wallet ?? "0",
      linked_phone: w.app_numbers?.linked_phone || track.phone || "0",
    },
    financing: {
      ...base.financing,
      ...w.financing,
      target_vehicle_name:
        w.financing?.target_vehicle_name ||
        track.financing.target_vehicle_name ||
        base.financing.target_vehicle_name,
    },
  };
}

export function resolveTrackGarage(track: CandidateTrackView): GaragePreview {
  return track.garage ?? fallbackGarage(track);
}
