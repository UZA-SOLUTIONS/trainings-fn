import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import {
  CASH_DISCOUNT,
  SPLIT_DISCOUNT,
  computeFinancing,
  formatRwf,
} from "@/utils/financing";
import {
  FALLBACK_INSTITUTION,
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

  const program = "tunga_taxi";
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

  const headline =
    payOption === "financed"
      ? {
          eyebrow: "Daily payment",
          amount: Math.round(financed.dailyPayment),
          unit: `RWF / day · ${financed.months} mo`,
        }
      : payOption === "cash"
        ? {
            eyebrow: "You pay",
            amount: Math.round(cash.payable),
            unit: `RWF · ${cash.discountPercent}% off`,
          }
        : {
            eyebrow: "Due now",
            amount: Math.round(split.now),
            unit: `RWF · 30% after ${split.discountPercent}% off`,
          };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/12 text-ink-foreground sm:rounded-[2rem]",
        className,
      )}
    >
      <img
        src="/ev.avif"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,oklch(0.16_0.04_158_/0.94)_0%,oklch(0.18_0.04_158_/0.88)_45%,oklch(0.2_0.03_158_/0.78)_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 55% 45% at 90% 10%, oklch(0.85 0.18 128 / 0.14), transparent 55%),
            radial-gradient(ellipse 40% 35% at 0% 100%, oklch(0.35 0.06 158 / 0.35), transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* Result */}
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10 xl:p-12">
          <div>
            <p className="text-eyebrow text-ink-foreground/55">{headline.eyebrow}</p>
            <p className="mt-3 font-display text-[2.75rem] font-bold leading-none tracking-tight sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              {headline.amount.toLocaleString("en-US")}
            </p>
            <p className="mt-3 text-sm text-ink-foreground/65 sm:text-base">{headline.unit}</p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {payOption === "financed" && (
              <>
                <Stat label="Monthly" value={formatRwf(financed.monthlyPayment)} />
                <Stat label="Financed" value={formatRwf(financed.principal)} />
                <Stat label="Interest" value={formatRwf(financed.totalInterest)} />
                <Stat
                  label="Collateral free"
                  value={
                    financed.equityReleaseMonth
                      ? `Mo ${financed.equityReleaseMonth}`
                      : "At end"
                  }
                />
                {financed.processingFee > 0 && (
                  <Stat label="Fee" value={formatRwf(financed.processingFee)} className="hidden sm:block" />
                )}
                {financed.annualInsurance > 0 && (
                  <Stat
                    label="Insurance / yr"
                    value={formatRwf(financed.annualInsurance)}
                    className="hidden sm:block"
                  />
                )}
              </>
            )}

            {payOption === "cash" && (
              <>
                <Stat label="List price" value={formatRwf(vehicleCost)} />
                <Stat label="Discount" value={`− ${formatRwf(cash.discountAmount)}`} />
                <Stat label="Due now" value={formatRwf(cash.payable)} className="sm:col-span-2" />
              </>
            )}

            {payOption === "split" && (
              <>
                <Stat label="List price" value={formatRwf(vehicleCost)} />
                <Stat label="Discount" value={`− ${formatRwf(split.discountAmount)}`} />
                <Stat label="Total" value={formatRwf(split.payable)} />
                <Stat label="On delivery" value={formatRwf(split.onDelivery)} />
              </>
            )}
          </dl>

          <p className="text-xs text-ink-foreground/45">Indicative · {routed.name}</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-7 p-6 sm:gap-8 sm:p-8 lg:p-10 xl:p-12">
          <div>
            <p className="text-eyebrow text-ink-foreground/55">Payment path</p>
            <div
              role="tablist"
              aria-label="Payment option"
              className="mt-3 grid grid-cols-3 gap-1.5"
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
                      "rounded-2xl border px-2 py-3 text-center text-sm font-medium transition-colors sm:px-3 sm:py-3.5",
                      active
                        ? "border-volt bg-volt text-volt-foreground"
                        : "border-white/15 bg-white/[0.04] text-ink-foreground/75 hover:border-white/30 hover:bg-white/[0.08] hover:text-ink-foreground",
                    )}
                  >
                    {PAY_OPTION_META[value].label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-foreground/60">
              {PAY_OPTION_META[payOption].description}
            </p>
          </div>

          <ControlBlock
            label="Vehicle cost"
            value={formatRwf(vehicleCost, { compact: true })}
          >
            <Slider
              className="mt-4"
              value={[vehicleCost]}
              min={8_000_000}
              max={35_000_000}
              step={500_000}
              onValueChange={([v]) => setVehicleCost(v ?? vehicleCost)}
            />
          </ControlBlock>

          {payOption === "financed" && (
            <>
              <ControlBlock
                label="Deposit"
                value={`${depositPercent}% · ${formatRwf(financed.clientDeposit, { compact: true })}`}
              >
                <Slider
                  className="mt-4"
                  value={[depositPercent]}
                  min={depositMin}
                  max={depositMax}
                  step={1}
                  onValueChange={([v]) => setDepositPercent(v ?? depositPercent)}
                />
                {financed.uzaAccessTopUp > 0 || belowRequired ? (
                  <p className="mt-2 text-xs text-ink-foreground/55">
                    {financed.uzaAccessTopUp > 0
                      ? `UZA Access +${formatRwf(financed.uzaAccessTopUp, { compact: true })}`
                      : null}
                    {financed.uzaAccessTopUp > 0 && belowRequired ? " · " : null}
                    {belowRequired ? `Below ${requiredPercent}% bank minimum` : null}
                  </p>
                ) : null}
              </ControlBlock>

              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-eyebrow text-ink-foreground/55">Term</p>
                  <p className="text-sm text-ink-foreground/55">
                    {(financed.annualRate * 100).toFixed(0)}% p.a.
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {terms.map((t) => {
                    const active = termYears === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTermYears(t)}
                        className={cn(
                          "min-w-[4.25rem] rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "border-volt bg-volt text-volt-foreground"
                            : "border-white/15 bg-white/[0.04] text-ink-foreground/75 hover:border-white/30 hover:bg-white/[0.08]",
                        )}
                      >
                        {t} yr
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ControlBlock({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-eyebrow text-ink-foreground/55">{label}</p>
        <p className="font-display text-base font-semibold tracking-tight sm:text-lg">{value}</p>
      </div>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3.5",
        className,
      )}
    >
      <dt className="text-xs text-ink-foreground/50">{label}</dt>
      <dd className="mt-1 font-display text-base font-semibold tracking-tight sm:text-lg">
        {value}
      </dd>
    </div>
  );
}
