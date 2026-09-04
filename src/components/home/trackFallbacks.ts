import type { CandidateTrackView } from "@/services/candidateService";
import type { WalletPreview } from "@/components/home/WalletUsagePanel";
import type { GarageHealth, GaragePreview } from "@/components/home/GarageHealthPanel";

export function emptyGarageHealth(): GarageHealth {
  return {
    overall_score: 0,
    status: "unknown",
    battery_percent: 0,
    battery_soh_percent: 0,
    battery_temp_c: 0,
    battery_cell_diff_mv: 0,
    charge_cycles: 0,
    charging_status: "unknown",
    range_km: 0,
    motor_health_percent: 0,
    inverter_health_percent: 0,
    coolant_temp_c: 0,
    tyre_health_percent: 0,
    tyre_pressure_fl_bar: 0,
    tyre_pressure_fr_bar: 0,
    tyre_pressure_rl_bar: 0,
    tyre_pressure_rr_bar: 0,
    brake_health_percent: 0,
    brake_pad_percent: 0,
    suspension_health_percent: 0,
    aux_12v_volt: 0,
    fault_codes_count: 0,
    active_warnings: [],
    software_version: "",
    odometer_km: 0,
    last_service_at: null,
    next_service_due_km: 0,
    last_diagnosis_at: null,
    inspection_passed: null,
  };
}

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
      "Garage should post a full diagnosis: battery SOH, motor, brakes, tyres, faults, and service data. Numbers stay at 0 until the first sync.",
    uza_id: track.candidate_code,
    vehicle: {
      plate: "",
      vin: "",
      model: track.financing.target_vehicle_name || "",
      garage_id: "",
      garage_name: "",
    },
    health: emptyGarageHealth(),
    updates: [],
    last_synced_at: null,
    endpoints: [
      {
        method: "POST",
        path: "/api/garage/:uzaId/updates",
        audience: ["garage", "staff"],
        purpose: "Ingest full EV diagnosis from the garage",
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
  const base = fallbackGarage(track);
  const g = track.garage;
  if (!g) return base;
  return {
    ...base,
    ...g,
    vehicle: { ...base.vehicle, ...g.vehicle },
    health: { ...base.health, ...g.health, active_warnings: g.health?.active_warnings ?? [] },
    updates: Array.isArray(g.updates) ? g.updates : [],
  };
}

/** Normalize financing numbers for track UI (never blank when DB has values). */
export function resolveTrackFinancing(track: CandidateTrackView) {
  const f = track.financing ?? ({} as CandidateTrackView["financing"]);
  const walletPrice = track.wallet?.financing?.selling_price_rwf ?? 0;
  const walletName = track.wallet?.financing?.target_vehicle_name ?? null;
  const walletDeposit = track.wallet?.financing?.driver_contribution_rwf ?? 0;

  const DEFAULT_VEHICLE_PRICE_RWF = 22_500_000;
  const name = (f.target_vehicle_name || walletName || "").trim() || null;
  let vehiclePrice = Number(f.target_vehicle_price_rwf);
  if (!Number.isFinite(vehiclePrice) || vehiclePrice <= 0) {
    vehiclePrice = Number(walletPrice) > 0 ? Number(walletPrice) : 0;
  }

  let depositOffered = Number(f.deposit_available_rwf);
  if (!Number.isFinite(depositOffered) || depositOffered < 0) {
    depositOffered = Number(walletDeposit) > 0 ? Number(walletDeposit) : 0;
  }

  // If contribution exists but price is missing, still compute 10%/90% on the programme default.
  if (vehiclePrice <= 0 && (name || depositOffered > 0)) {
    vehiclePrice = DEFAULT_VEHICLE_PRICE_RWF;
  }

  // Programme split: 10% target deposit · bank finances the rest of the vehicle price
  const depositTenPercent = vehiclePrice > 0 ? Math.round(vehiclePrice * 0.1) : 0;
  // Bank pays = car price − candidate contribution (remaining after what they offered)
  const bankPaysRemaining =
    vehiclePrice > 0 ? Math.max(0, Math.round(vehiclePrice - depositOffered)) : 0;
  const remainingToTenPercent = Math.max(0, depositTenPercent - depositOffered);
  const depositPct =
    depositTenPercent > 0
      ? Math.min(100, Math.round((depositOffered / depositTenPercent) * 100))
      : 0;

  // Legacy fields used elsewhere (may use 10% or 15% from API)
  let depositRequired = Number(f.deposit_required_rwf);
  let depositPercent = Number(f.deposit_required_percent);
  if ((!Number.isFinite(depositRequired) || depositRequired <= 0) && vehiclePrice > 0) {
    depositRequired = depositTenPercent;
    depositPercent = 0.1;
  }
  if (!Number.isFinite(depositPercent) || depositPercent <= 0) {
    depositPercent = 0.1;
  }

  return {
    ...f,
    target_vehicle_name: name,
    target_vehicle_price_rwf: vehiclePrice,
    deposit_available_rwf: depositOffered,
    deposit_required_rwf: depositRequired > 0 ? depositRequired : null,
    deposit_required_percent: depositRequired > 0 ? depositPercent : null,
    deposit_pct: depositPct,
    /** Candidate contribution offered toward the vehicle. */
    deposit_offered_rwf: depositOffered,
    /** Full 10% deposit the structure requires. */
    deposit_ten_percent_rwf: depositTenPercent,
    /** Still needed to complete the 10% deposit. */
    remaining_to_ten_percent_rwf: remainingToTenPercent,
    /** Bank share — vehicle price minus candidate contribution. */
    bank_ninety_percent_rwf: bankPaysRemaining,
    bank_finance_rwf: bankPaysRemaining,
    deposit_gap_rwf: remainingToTenPercent,
    deposit_surplus_rwf: Math.max(0, depositOffered - depositTenPercent),
  };
}
