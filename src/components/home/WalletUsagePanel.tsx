import { useState } from "react";
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCreditCard,
} from "react-icons/fi";
import { formatRwf } from "@/utils/financing";
import { cn } from "@/lib/utils";

export type WalletPreview = {
  status: "planned" | string;
  live: boolean;
  message: string;
  uza_id: string;
  audience: string;
  app_numbers?: {
    momo: string;
    airtel: string;
    uza_wallet: string;
    linked_phone: string;
  };
  balances: {
    available_rwf: number;
    savings_locked_rwf: number;
    commission_owed_rwf: number;
    currency: string;
    endpoint: string;
  };
  daily: {
    source: string;
    live: boolean;
    gross_rwf: number;
    uza_commission_rwf: number;
    driver_fare_share_rwf: number;
    vehicle_owner_due_rwf: number | null;
    loan_instalment_rwf: number | null;
    savings_rwf: number | null;
    yours_to_keep_rwf: number | null;
    split: { driver_percent: number; uza_percent: number };
    endpoint: string;
  };
  savings: {
    live: boolean;
    mode: string | null;
    streak_days: number;
    pot_rwf: number;
    pays_loan_instalment: boolean;
    endpoint: string;
  };
  loan: {
    live: boolean;
    days_ahead: number | null;
    days_behind: number | null;
    principal_rwf: number;
    term_months: number;
    endpoint: string;
  };
  financing: {
    selling_price_rwf: number;
    target_vehicle_name: string | null;
    driver_contribution_rwf: number;
    bank_deposit_required_rwf: number;
    bank_deposit_percent: number;
    min_driver_contribution_rwf: number;
    uza_access_gap_rwf: number;
    uza_access_active: boolean;
    package_total_rwf: number;
    loan_principal_rwf: number;
    identity_holds: boolean;
    term_months: number;
    collateral_release_month: number;
    note: string;
  };
  bank_signals: {
    sees_full_ten_percent_deposit: boolean;
    deposit_cover_percent: number;
    min_contribution_met: boolean;
    training_stands_in_for_equity: boolean;
    repayment_rail: string;
    trust_score: number | null;
    trust_endpoint: string;
    risk_endpoint: string;
  };
  endpoints: Array<{
    method: string;
    path: string;
    audience: string[];
    purpose: string;
  }>;
};

type CashflowTab = "income" | "expenses";

type CashflowItem = {
  id: string;
  label: string;
  detail?: string;
  amount: number;
  at?: string | null;
};

const VALUE = "font-display font-medium tracking-tight tabular-nums text-foreground";

/**
 * Driver / bank facing UZA wallet — balance, income & expenses.
 * Use `embedded` inside CandidateDossierCard (no outer shell / title).
 */
export function WalletUsagePanel({
  wallet,
  variant = "track",
  embedded = false,
}: {
  wallet: WalletPreview;
  variant?: "track" | "bank";
  embedded?: boolean;
}) {
  const { financing, app_numbers } = wallet;
  const [tab, setTab] = useState<CashflowTab>("income");

  const appNumbers = app_numbers ?? {
    momo: "0",
    airtel: "0",
    uza_wallet: "0",
    linked_phone: "0",
  };

  const incomeItems: CashflowItem[] = [];
  const expenseItems: CashflowItem[] = [];
  const incomeTotal = 0;
  const expenseTotal = 0;
  const activeItems = tab === "income" ? incomeItems : expenseItems;

  const statusLabel = wallet.live ? "Active" : "Not active";
  const statusTone = wallet.live
    ? "bg-emerald-600 text-white"
    : "border-2 border-amber-400/70 bg-amber-100 text-amber-800";

  const balanceRows = [
    {
      label: "Available",
      amount: wallet.balances.available_rwf,
      compact: false,
      emphasize: true,
    },
    {
      label: "Savings locked",
      amount: wallet.balances.savings_locked_rwf,
      compact: true,
      emphasize: false,
    },
    {
      label: "Commission owed",
      amount: wallet.balances.commission_owed_rwf,
      compact: true,
      emphasize: false,
    },
  ];

  const railRows = [
    {
      label: "MTN MoMo",
      value: appNumbers.momo || "0",
      iconSrc: "/mtn.webp",
    },
    {
      label: "Airtel Money",
      value: appNumbers.airtel || "0",
      iconSrc: "/airtel.webp",
    },
    { label: "UZA wallet", value: appNumbers.uza_wallet || "0" },
    { label: "Linked phone", value: appNumbers.linked_phone || "0" },
  ];

  const detailRows = [
    {
      label: "EV of choice",
      value: financing.target_vehicle_name?.trim() || "Not selected yet",
    },
    { label: "UZA ID", value: wallet.uza_id || "—" },
  ];

  const body = (
    <div className="grid lg:grid-cols-2">
      <div className="border-b border-border/40 p-5 sm:p-6 lg:border-b-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="flex items-center gap-2 font-display text-base font-semibold text-primary sm:text-lg">
            <FiCreditCard className="size-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Wallet balances
          </h3>
          <span
            className={cn(
              "inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold",
              statusTone,
            )}
          >
            {statusLabel}
          </span>
        </div>

        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {balanceRows.map((row) => (
            <li key={row.label} className="min-w-0">
              <p className="text-base font-semibold text-primary/90">{row.label}</p>
              <p
                className={cn(
                  VALUE,
                  "mt-1.5",
                  row.emphasize ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
                )}
              >
                {formatRwf(row.amount, { compact: row.compact })}
              </p>
            </li>
          ))}
        </ul>

        <h3 className="mt-8 font-display text-base font-semibold text-primary sm:text-lg">
          Linked accounts
        </h3>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {railRows.map((row) => (
            <li key={row.label} className="min-w-0">
              <div className="flex items-center gap-2">
                {"iconSrc" in row && row.iconSrc ? (
                  <img
                    src={row.iconSrc}
                    alt=""
                    className="h-6 w-6 shrink-0 object-contain"
                  />
                ) : null}
                <p className="truncate text-base font-semibold text-primary/90">{row.label}</p>
              </div>
              <p className="mt-1.5 text-base text-foreground/90 sm:text-lg">{row.value}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {detailRows.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-base font-semibold text-primary/90">{row.label}</dt>
              <dd className="mt-1.5 min-w-0 break-words text-base text-foreground/90 sm:text-lg">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="font-display text-base font-semibold text-primary sm:text-lg">
          Cashflow
        </h3>

        <div className="mt-4 flex gap-6">
          <button
            type="button"
            onClick={() => setTab("income")}
            className={cn(
              "flex items-center gap-2 py-1 font-display text-base font-medium tracking-tight transition-colors",
              tab === "income"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FiArrowDownLeft className="text-emerald-600" size={18} aria-hidden />
            Income
            <span className={cn(VALUE, "text-sm text-emerald-700 sm:text-base")}>
              {formatRwf(incomeTotal, { compact: true })}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab("expenses")}
            className={cn(
              "flex items-center gap-2 py-1 font-display text-base font-medium tracking-tight transition-colors",
              tab === "expenses"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FiArrowUpRight className="text-destructive" size={18} aria-hidden />
            Expenses
            <span className={cn(VALUE, "text-sm text-destructive sm:text-base")}>
              {formatRwf(expenseTotal, { compact: true })}
            </span>
          </button>
        </div>

        <div className="mt-5">
          <div className="grid grid-cols-[7rem_1fr_6.5rem] gap-3 border-b border-border/70 pb-2 text-sm font-semibold text-primary/90">
            <span>Date</span>
            <span>Description</span>
            <span className="text-right">Amount</span>
          </div>

          {activeItems.length === 0 ? (
            <ul className="mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <li
                  key={`placeholder-${i}`}
                  className="grid grid-cols-[7rem_1fr_6.5rem] items-center gap-3 border-b border-dotted border-border/80 py-3.5 text-base text-muted-foreground/50"
                >
                  <span>—</span>
                  <span>—</span>
                  <span className="text-right">—</span>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-1">
              {activeItems.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[7rem_1fr_6.5rem] items-center gap-3 border-b border-dotted border-border/80 py-3.5"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.at ? new Date(item.at).toLocaleDateString("en-GB") : "—"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-base font-medium tracking-tight">
                      {item.label}
                    </p>
                    {item.detail && (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{item.detail}</p>
                    )}
                  </div>
                  <span
                    className={cn(
                      VALUE,
                      "text-right text-base",
                      tab === "income" ? "text-emerald-700" : "text-destructive",
                    )}
                  >
                    {tab === "income" ? "+" : "−"}
                    {formatRwf(item.amount, { compact: true })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return <div className="border-t border-border/40">{body}</div>;
  }

  return (
    <div className="overflow-hidden border-2 border-primary/50 bg-background shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-primary/25 px-4 py-3.5 sm:px-5">
        <div className="flex flex-wrap items-center gap-3 text-primary">
          <h2 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
            {variant === "bank" ? "Driver UZA wallet" : "Your UZA wallet"}
          </h2>
          <span
            className={cn(
              "inline-flex h-11 items-center rounded-full px-5 text-base font-semibold capitalize",
              statusTone,
            )}
          >
            {statusLabel}
          </span>
        </div>
      </div>
      {body}
    </div>
  );
}
