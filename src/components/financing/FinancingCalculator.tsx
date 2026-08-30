import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  CASH_DISCOUNT,
  SPLIT_DISCOUNT,
  computeFinancing,
  formatRwf,
} from "@/utils/financing";
import {
  FALLBACK_INSTITUTION,
  PROGRAMS,
  depositPercentFor,
  institutionForProgram,
  useInstitutions,
  type Institution,
} from "@/utils/institutions";
import { cn } from "@/lib/utils";

export type PayOption = "cash" | "split" | "financed";

export const PAY_OPTION_META: Record<
  PayOption,
  { title: string; description: string; label: string }
> = {
  cash: {
    label: "Cash",
    title: "Cash purchase",
    description: "Full payment before sailing · 3% discount on vehicle cost.",
  },
  split: {
    label: "Split",
    title: "Split payment",
    description: "30% now, 70% on delivery · 1.5% discount on full price.",
  },
  financed: {
    label: "Financed",
    title: "Bank-financed",
    description: "Bank loan with deposit and term. Daily instalment shown for your inputs.",
  },
};

const PAY_OPTIONS: PayOption[] = ["cash", "split", "financed"];

const PROGRAM_SHORT: Record<string, string> = {
  tunga_taxi: "Tunga Taxi",
  fleet_partners: "Fleet",
  individual_buyers: "Individual",
};

type FinancingCalculatorProps = {
  /** Controlled payment option (e.g. from offer buttons). */
  option?: PayOption;
  onOptionChange?: (option: PayOption) => void;
  className?: string;
};

export function FinancingCalculator({
  option: controlledOption,
  onOptionChange,
  className,
}: FinancingCalculatorProps) {
  const { data: institutions } = useInstitutions();

  const [internalOption, setInternalOption] = useState<PayOption>(
    controlledOption ?? "financed",
  );
  const payOption = controlledOption ?? internalOption;

  const [program, setProgram] = useState("tunga_taxi");
  const [vehicleCost, setVehicleCost] = useState(16_000_000);
  const [depositPercent, setDepositPercent] = useState(10);
  const [termYears, setTermYears] = useState(3);

  const list = institutions ?? [];
  const routed: Institution =
    institutionForProgram(list, program) ?? list[0] ?? FALLBACK_INSTITUTION;

  const requiredPercent = Math.round(depositPercentFor(routed, vehicleCost) * 100);

  useEffect(() => {
    if (controlledOption) setInternalOption(controlledOption);
  }, [controlledOption]);

  useEffect(() => {
    if (payOption === "cash") setDepositPercent(100);
    else if (payOption === "split") setDepositPercent(30);
    else setDepositPercent(requiredPercent);
  }, [payOption, requiredPercent]);

  useEffect(() => {
    setTermYears((t) => Math.min(Math.max(t, routed.min_term_years), routed.max_term_years));
  }, [routed.min_term_years, routed.max_term_years]);

  const terms = useMemo(() => {
    const out: number[] = [];
    for (let y = routed.min_term_years; y <= routed.max_term_years; y++) out.push(y);
    return out;
  }, [routed.min_term_years, routed.max_term_years]);

  const financed = useMemo(
    () =>
      computeFinancing({
        vehicleCost,
        depositPercent: depositPercent / 100,
        termYears,
        institution: routed,
      }),
    [vehicleCost, depositPercent, termYears, routed],
  );

  const cash = useMemo(() => {
    const discountAmount = vehicleCost * CASH_DISCOUNT;
    const payable = vehicleCost - discountAmount;
    return { discountAmount, payable, discountPercent: CASH_DISCOUNT * 100 };
  }, [vehicleCost]);

  const split = useMemo(() => {
    const discountAmount = vehicleCost * SPLIT_DISCOUNT;
    const payable = vehicleCost - discountAmount;
    return {
      discountAmount,
      payable,
      now: payable * 0.3,
      onDelivery: payable * 0.7,
      discountPercent: SPLIT_DISCOUNT * 100,
    };
  }, [vehicleCost]);

  const belowRequired = payOption === "financed" && depositPercent < requiredPercent;
  const depositMax = payOption === "cash" ? 100 : 40;
  const depositMin = payOption === "split" ? 30 : 0;

  function selectPayOption(next: PayOption) {
    setInternalOption(next);
    onOptionChange?.(next);
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-2.5 py-1.5 text-xs font-normal transition-colors sm:px-4 sm:py-2 sm:text-sm",
      active
        ? "border-transparent bg-volt text-volt-foreground"
        : "border-white/25 bg-white/5 text-ink-foreground/80 hover:bg-white/10",
    );

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border-white/10 p-0 text-ink-foreground",
        className,
      )}
    >
      <img
        src="/ev.avif"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[oklch(0.16_0.04_158)]/84 md:bg-[oklch(0.16_0.04_158)]/80" />

      <div className="relative z-10 flex flex-col md:grid md:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 space-y-4 border-white/10 p-4 sm:space-y-6 sm:p-6 md:order-1 md:border-r md:p-8 lg:p-10">
          <div>
            <p className="text-eyebrow opacity-70">Payment</p>
            <div
              role="tablist"
              aria-label="Payment option"
              className="mt-2 grid grid-cols-3 gap-0.5 rounded-full border border-white/20 bg-white/5 p-0.5 sm:mt-3 sm:gap-1 sm:p-1"
            >
              {PAY_OPTIONS.map((value) => {
                const active = payOption === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectPayOption(value)}
                    className={cn(
                      "rounded-full px-1.5 py-2 text-[11px] font-medium transition-colors sm:px-3 sm:py-2.5 sm:text-sm",
                      active
                        ? "bg-volt text-volt-foreground"
                        : "text-ink-foreground/70 hover:text-ink-foreground",
                    )}
                  >
                    {PAY_OPTION_META[value].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-eyebrow opacity-70">Buyer</p>
            <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
              {PROGRAMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setProgram(p.value)}
                  className={chip(program === p.value)}
                >
                  {PROGRAM_SHORT[p.value] ?? p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-eyebrow opacity-70">Vehicle cost</p>
              <p className="font-display text-base font-semibold tracking-tight sm:text-lg">
                {formatRwf(vehicleCost, { compact: true })}
              </p>
            </div>
            <Slider
              className="mt-3 sm:mt-4"
              value={[vehicleCost]}
              min={8_000_000}
              max={35_000_000}
              step={500_000}
              onValueChange={([v]) => setVehicleCost(v ?? vehicleCost)}
            />
          </div>

          {payOption === "financed" && (
            <>
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-eyebrow opacity-70">Deposit</p>
                  <p className="font-display text-base font-semibold sm:text-lg">
                    {depositPercent}%
                    <span className="mx-1 opacity-40 sm:mx-1.5">·</span>
                    {formatRwf(financed.clientDeposit, { compact: true })}
                  </p>
                </div>
                <Slider
                  className="mt-3 sm:mt-4"
                  value={[depositPercent]}
                  min={depositMin}
                  max={depositMax}
                  step={1}
                  onValueChange={([v]) => setDepositPercent(v ?? depositPercent)}
                />
                {financed.uzaAccessTopUp > 0 || belowRequired ? (
                  <p className="mt-1.5 text-[11px] opacity-70 sm:mt-2 sm:text-xs">
                    {financed.uzaAccessTopUp > 0
                      ? `UZA Access +${formatRwf(financed.uzaAccessTopUp, { compact: true })}`
                      : null}
                    {financed.uzaAccessTopUp > 0 && belowRequired ? " · " : null}
                    {belowRequired ? `Below ${requiredPercent}% bank minimum` : null}
                  </p>
                ) : null}
              </div>

              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-eyebrow opacity-70">Term</p>
                  <p className="text-xs opacity-70 sm:text-sm">
                    {(financed.annualRate * 100).toFixed(0)}% p.a.
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                  {terms.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTermYears(t)}
                      className={chip(termYears === t)}
                    >
                      {t} yr
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="order-1 flex min-h-0 flex-col justify-between gap-4 border-b border-white/10 p-4 sm:gap-6 sm:p-6 md:order-2 md:min-h-[24rem] md:border-b-0 md:p-8 lg:p-10">
          {payOption === "financed" && (
            <>
              <div>
                <p className="text-eyebrow opacity-70">Daily payment</p>
                <p className="mt-1.5 font-display text-[2.15rem] font-bold leading-none tracking-tight sm:mt-2 sm:text-5xl md:text-6xl">
                  {Math.round(financed.dailyPayment).toLocaleString("en-US")}
                </p>
                <p className="mt-1.5 text-xs opacity-70 sm:mt-2 sm:text-sm">
                  RWF / day · {financed.months} mo
                </p>
              </div>

              <dl className="space-y-2 border-t border-white/15 pt-4 text-sm sm:space-y-3 sm:pt-6">
                <Row label="Monthly" value={formatRwf(financed.monthlyPayment)} />
                <Row label="Financed" value={formatRwf(financed.principal)} />
                <Row label="Interest" value={formatRwf(financed.totalInterest)} />
                {financed.processingFee > 0 && (
                  <div className="hidden sm:block">
                    <Row label="Fee" value={formatRwf(financed.processingFee)} />
                  </div>
                )}
                {financed.annualInsurance > 0 && (
                  <div className="hidden sm:block">
                    <Row label="Insurance / yr" value={formatRwf(financed.annualInsurance)} />
                  </div>
                )}
                <div className="hidden sm:block">
                  <Row
                    label="Collateral free"
                    value={
                      financed.equityReleaseMonth
                        ? `Mo ${financed.equityReleaseMonth}`
                        : "At end"
                    }
                  />
                </div>
              </dl>
            </>
          )}

          {payOption === "cash" && (
            <>
              <div>
                <p className="text-eyebrow opacity-70">You pay</p>
                <p className="mt-1.5 font-display text-[2.15rem] font-bold leading-none tracking-tight sm:mt-2 sm:text-5xl md:text-6xl">
                  {Math.round(cash.payable).toLocaleString("en-US")}
                </p>
                <p className="mt-1.5 text-xs opacity-70 sm:mt-1 sm:text-sm">
                  RWF · {cash.discountPercent}% off
                </p>
              </div>

              <dl className="space-y-2 border-t border-white/15 pt-4 text-sm sm:space-y-3 sm:pt-6">
                <Row label="List price" value={formatRwf(vehicleCost)} />
                <Row label="Discount" value={`− ${formatRwf(cash.discountAmount)}`} />
                <Row label="Due now" value={formatRwf(cash.payable)} />
              </dl>
            </>
          )}

          {payOption === "split" && (
            <>
              <div>
                <p className="text-eyebrow opacity-70">Due now</p>
                <p className="mt-1.5 font-display text-[2.15rem] font-bold leading-none tracking-tight sm:mt-2 sm:text-5xl md:text-6xl">
                  {Math.round(split.now).toLocaleString("en-US")}
                </p>
                <p className="mt-1.5 text-xs opacity-70 sm:mt-1 sm:text-sm">
                  RWF · 30% after {split.discountPercent}% off
                </p>
              </div>

              <dl className="space-y-2 border-t border-white/15 pt-4 text-sm sm:space-y-3 sm:pt-6">
                <Row label="List price" value={formatRwf(vehicleCost)} />
                <Row label="Discount" value={`− ${formatRwf(split.discountAmount)}`} />
                <Row label="Total" value={formatRwf(split.payable)} />
                <Row label="On delivery" value={formatRwf(split.onDelivery)} />
              </dl>
            </>
          )}

          <p className="text-[11px] opacity-55 sm:text-xs">Indicative · {routed.name}</p>
        </div>
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 sm:gap-6">
      <dt className="shrink-0 opacity-75">{label}</dt>
      <dd className="min-w-0 break-words text-right font-display font-semibold tracking-tight">
        {value}
      </dd>
    </div>
  );
}
