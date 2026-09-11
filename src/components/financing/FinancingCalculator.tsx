import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  option?: PayOption;
  onOptionChange?: (option: PayOption) => void;
  className?: string;
};

/** Glassmorphism calculator over a forest still — left copy, right interactive panel. */
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

  const primaryResult =
    payOption === "financed"
      ? {
          label: "Daily payment",
          amount: formatRwf(Math.round(financed.dailyPayment)),
          suffix: `/ day · ${financed.months} mo`,
          iconSrc: "/cash.png",
        }
      : payOption === "cash"
        ? {
            label: "You pay",
            amount: formatRwf(Math.round(cash.payable)),
            suffix: `· ${cash.discountPercent}% off`,
            iconSrc: "/cash.png",
          }
        : {
            label: "Due now",
            amount: formatRwf(Math.round(split.now)),
            suffix: `· 30% after ${split.discountPercent}% off`,
            iconSrc: "/cash.png",
          };

  const secondaryResult =
    payOption === "financed"
      ? {
          label: "Monthly",
          amount: formatRwf(Math.round(financed.monthlyPayment)),
          suffix: `· Financed ${formatRwf(financed.principal, { compact: true })}`,
          iconSrc: "/cash2.png",
        }
      : payOption === "cash"
        ? {
            label: "You save",
            amount: formatRwf(Math.round(cash.discountAmount)),
            suffix: "· Discount on list price",
            iconSrc: "/cash2.png",
          }
        : {
            label: "On delivery",
            amount: formatRwf(Math.round(split.onDelivery)),
            suffix: "· Remaining 70%",
            iconSrc: "/cash2.png",
          };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]",
        className,
      )}
    >
      <img
        src="/calculator-forest.png"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[oklch(0.22_0.05_145_/0.55)]" />

      <div className="relative z-10 grid gap-10 px-5 py-10 sm:gap-12 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14 lg:px-12 lg:py-16 xl:px-16">
        <div className="max-w-lg text-white">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Plan your path to an EV
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">
            Model cash, split, or bank financing against a real vehicle price. Estimates help you
            plan. Final terms come from your partner bank.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-[15px]">
            Adjust the sliders to see daily or upfront payments update live. Indicative rates use{" "}
            {routed.name}.
          </p>
          <Link
            to="/apply"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Apply now
          </Link>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/15 p-5 shadow-xl backdrop-blur-md sm:rounded-3xl sm:p-7 md:p-8">
          <div
            role="tablist"
            aria-label="Payment option"
            className="grid grid-cols-3 gap-2"
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
                    "rounded-lg px-2 py-2.5 text-center text-sm font-medium transition-colors",
                    active
                      ? "bg-volt text-volt-foreground"
                      : "bg-white/20 text-white hover:bg-white/30",
                  )}
                >
                  {PAY_OPTION_META[value].label}
                </button>
              );
            })}
          </div>

          <div className="mt-7 space-y-6">
            <GlassSliderRow
              label="Vehicle cost"
              display={formatRwf(vehicleCost, { compact: true })}
            >
              <Slider
                value={[vehicleCost]}
                min={8_000_000}
                max={35_000_000}
                step={500_000}
                onValueChange={([v]) => setVehicleCost(v ?? vehicleCost)}
              />
            </GlassSliderRow>

            {payOption === "financed" && (
              <>
                <GlassSliderRow
                  label="Deposit"
                  display={`${depositPercent}%`}
                  note={
                    financed.uzaAccessTopUp > 0 || belowRequired
                      ? [
                          financed.uzaAccessTopUp > 0
                            ? `UZA Access +${formatRwf(financed.uzaAccessTopUp, { compact: true })}`
                            : null,
                          financed.uzaAccessTopUp > 0 && belowRequired ? " · " : null,
                          belowRequired ? `Below ${requiredPercent}% bank minimum` : null,
                        ]
                          .filter(Boolean)
                          .join("")
                      : undefined
                  }
                >
                  <Slider
                    value={[depositPercent]}
                    min={depositMin}
                    max={depositMax}
                    step={1}
                    onValueChange={([v]) => setDepositPercent(v ?? depositPercent)}
                  />
                </GlassSliderRow>

                <div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <p className="w-[6.5rem] shrink-0 text-sm text-white/85 sm:w-28">Term</p>
                    <div
                      className="grid min-w-0 flex-1 gap-2"
                      style={{ gridTemplateColumns: `repeat(${terms.length}, minmax(0, 1fr))` }}
                    >
                      {terms.map((t) => {
                        const active = termYears === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTermYears(t)}
                            className={cn(
                              "w-full rounded-lg px-2 py-2.5 text-sm font-medium transition-colors sm:py-3",
                              active
                                ? "bg-volt text-volt-foreground"
                                : "bg-white/20 text-white hover:bg-white/30",
                            )}
                          >
                            {t} yr
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <p className="mt-2 pl-[calc(6.5rem+0.75rem)] text-xs text-white/65 sm:pl-[calc(7rem+1rem)]">
                    {(financed.annualRate * 100).toFixed(0)}% p.a. indicative
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <ResultCard {...primaryResult} />
            <ResultCard {...secondaryResult} />
          </div>
        </div>
      </div>
    </div>
  );
}

function GlassSliderRow({
  label,
  display,
  note,
  children,
}: {
  label: string;
  display: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 sm:gap-4">
        <p className="w-[6.5rem] shrink-0 text-sm text-white/85 sm:w-28">{label}</p>
        <div className="min-w-0 flex-1">{children}</div>
        <div className="flex h-10 min-w-[5.5rem] shrink-0 items-center justify-center rounded-md bg-white px-3 text-sm font-semibold text-neutral-900 sm:min-w-[6.5rem]">
          {display}
        </div>
      </div>
      {note ? <p className="mt-2 pl-[calc(6.5rem+0.75rem)] text-xs text-white/70 sm:pl-[calc(7rem+1rem)]">{note}</p> : null}
    </div>
  );
}

function ResultCard({
  label,
  amount,
  suffix,
  iconSrc,
}: {
  label: string;
  amount: string;
  suffix: string;
  iconSrc: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-neutral-900 shadow-sm sm:px-5 sm:py-5">
      <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
        <img src={iconSrc} alt="" className="size-7 object-contain" aria-hidden />
      </div>
      <p className="min-w-0 text-sm leading-snug text-neutral-700 sm:text-[15px]">
        <span>{label}: </span>
        <span className="font-bold text-neutral-900">{amount}</span>
        <span> {suffix}</span>
      </p>
    </div>
  );
}
