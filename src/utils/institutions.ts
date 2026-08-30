// Partner financing institutions. Each bank defines its own loan formula.

import { useQuery } from "@tanstack/react-query";
import { listInstitutions } from "@/services/institutionService";

export interface RateTier {
  max_years: number;
  annual_rate: number;
}

export interface DepositTier {
  max_price_rwf: number | null;
  percent: number;
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  target_program: string;
  is_default_for_program: boolean;
  is_active: boolean;
  rate_tiers: RateTier[];
  deposit_tiers: DepositTier[];
  min_client_contribution_rwf: number;
  collateral_percent: number;
  equity_release_percent: number;
  min_term_years: number;
  max_term_years: number;
  processing_fee_percent: number;
  insurance_percent_per_year: number;
  supports_uza_access_topup: boolean;
  notes: string | null;
}

export const PROGRAMS: { value: string; label: string; blurb: string }[] = [
  {
    value: "tunga_taxi",
    label: "Tunga Taxi",
    blurb: "Taxi drivers moving from renting to owning an electric taxi.",
  },
  {
    value: "fleet_partners",
    label: "Fleet & corporates",
    blurb: "Companies and cooperatives financing several vehicles at once.",
  },
  {
    value: "individual_buyers",
    label: "Individual buyers",
    blurb: "Salaried buyers financing a personal electric vehicle.",
  },
];

export function programLabel(value: string): string {
  return PROGRAMS.find((p) => p.value === value)?.label ?? value;
}

function asTiers<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length ? (value as T[]) : fallback;
}

export function parseInstitution(row: Record<string, unknown>): Institution {
  const r = row as unknown as Institution;
  return {
    ...r,
    rate_tiers: asTiers<RateTier>(r.rate_tiers, [{ max_years: 5, annual_rate: 0.34 }]).sort(
      (a, b) => a.max_years - b.max_years,
    ),
    deposit_tiers: asTiers<DepositTier>(r.deposit_tiers, [
      { max_price_rwf: null, percent: 0.1 },
    ]).sort((a, b) => (a.max_price_rwf ?? Infinity) - (b.max_price_rwf ?? Infinity)),
  };
}

export const FALLBACK_INSTITUTION: Institution = {
  id: "fallback",
  name: "Unguka Bank",
  code: "UNGUKA",
  target_program: "tunga_taxi",
  is_default_for_program: true,
  is_active: true,
  rate_tiers: [
    { max_years: 3, annual_rate: 0.34 },
    { max_years: 5, annual_rate: 0.36 },
  ],
  deposit_tiers: [
    { max_price_rwf: 25_000_000, percent: 0.1 },
    { max_price_rwf: null, percent: 0.15 },
  ],
  min_client_contribution_rwf: 500_000,
  collateral_percent: 0.3,
  equity_release_percent: 0.9,
  min_term_years: 1,
  max_term_years: 5,
  processing_fee_percent: 0.02,
  insurance_percent_per_year: 0.04,
  supports_uza_access_topup: true,
  notes: null,
};

export function rateForTerm(inst: Institution, years: number): number {
  const tier = inst.rate_tiers.find((t) => years <= t.max_years);
  return tier?.annual_rate ?? inst.rate_tiers[inst.rate_tiers.length - 1]?.annual_rate ?? 0.34;
}

export function depositPercentFor(inst: Institution, priceRwf: number): number {
  const tier = inst.deposit_tiers.find(
    (t) => t.max_price_rwf === null || priceRwf <= t.max_price_rwf,
  );
  return tier?.percent ?? inst.deposit_tiers[inst.deposit_tiers.length - 1]?.percent ?? 0.1;
}

export function institutionForProgram(
  institutions: Institution[],
  program: string,
): Institution | undefined {
  const inProgram = institutions.filter((i) => i.is_active && i.target_program === program);
  return inProgram.find((i) => i.is_default_for_program) ?? inProgram[0];
}

export function useInstitutions(opts: { activeOnly?: boolean } = {}) {
  const activeOnly = opts.activeOnly ?? true;
  return useQuery({
    queryKey: ["financing-institutions", activeOnly],
    queryFn: async (): Promise<Institution[]> => {
      const rows = await listInstitutions({ activeOnly });
      return rows.map((row) => parseInstitution(row as Record<string, unknown>));
    },
  });
}
