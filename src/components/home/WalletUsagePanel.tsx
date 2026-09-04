import { useState } from "react";
import { FiArrowDownLeft, FiArrowUpRight, FiEye, FiEyeOff } from "react-icons/fi";
import { formatRwf } from "@/utils/financing";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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

const VALUE = "font-display font-light tracking-tight tabular-nums text-foreground";
const HIDDEN = "••••••";

function MoneyAmount({
  amount,
  compact = false,
  prefix = "",
  className,
  iconClassName,
}: {
  amount: number | null | undefined;
  compact?: boolean;
  prefix?: string;
  className?: string;
  iconClassName?: string;
}) {
  const [visible, setVisible] = useState(true);
  const display =
    amount == null
      ? "0 RWF"
      : formatRwf(amount, { compact });

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={VALUE}>
        {visible ? `${prefix}${display}` : HIDDEN}
      </span>
      <button
        type="button"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          iconClassName,
        )}
        onClick={(e) => {
          e.stopPropagation();
          setVisible((v) => !v);
        }}
        aria-label={visible ? "Hide amount" : "Show amount"}
        aria-pressed={!visible}
      >
        {visible ? <FiEyeOff size={16} aria-hidden /> : <FiEye size={16} aria-hidden />}
      </button>
    </span>
  );
}

/**
 * Driver / bank facing UZA wallet — balance, hide amounts, income & expenses.
 */
export function WalletUsagePanel({
  wallet,
  variant = "track",
}: {
  wallet: WalletPreview;
  variant?: "track" | "bank";
}) {
  const { financing, app_numbers } = wallet;
  const [tab, setTab] = useState<CashflowTab>("income");

  const appNumbers = app_numbers ?? {
    momo: "0",
    airtel: "0",
    uza_wallet: "0",
    linked_phone: "0",
  };

  // Ledger not wired yet — totals stay at 0; real transactions will list below.
  const incomeItems: CashflowItem[] = [];
  const expenseItems: CashflowItem[] = [];
  const incomeTotal = 0;
  const expenseTotal = 0;
  const activeItems = tab === "income" ? incomeItems : expenseItems;

  return (
    <Card className="border-border/70 p-6 sm:p-8">
      <div>
        <h3 className={cn(VALUE, "text-2xl sm:text-3xl")}>
          {variant === "bank" ? "Driver UZA wallet" : "Your UZA wallet"}
        </h3>
        <p className="mt-2 font-display text-base font-light tracking-tight text-foreground sm:text-lg">
          EV of choice: {financing.target_vehicle_name?.trim() || "Not selected yet"}
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-border/50 bg-muted/25 px-4 py-5 sm:px-6">
        <MoneyAmount
          amount={wallet.balances.available_rwf}
          className="text-4xl sm:text-5xl [&_span]:text-4xl sm:[&_span]:text-5xl"
          iconClassName="p-1.5"
        />
        <dl className="mt-5 grid gap-4 border-t border-border/50 pt-4 sm:grid-cols-2">
          <div>
            <dt className="font-display text-sm font-light text-muted-foreground">Savings locked</dt>
            <dd className="mt-1">
              <MoneyAmount
                amount={wallet.balances.savings_locked_rwf}
                compact
                className="text-xl sm:text-2xl [&_span]:text-xl sm:[&_span]:text-2xl"
              />
            </dd>
          </div>
          <div>
            <dt className="font-display text-sm font-light text-muted-foreground">Commission owed</dt>
            <dd className="mt-1">
              <MoneyAmount
                amount={wallet.balances.commission_owed_rwf}
                compact
                className="text-xl sm:text-2xl [&_span]:text-xl sm:[&_span]:text-2xl"
              />
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 rounded-xl border border-border/50 px-4 py-4 sm:px-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "MTN MoMo", value: appNumbers.momo },
            { label: "Airtel Money", value: appNumbers.airtel },
            { label: "UZA wallet", value: appNumbers.uza_wallet },
            { label: "Linked phone", value: appNumbers.linked_phone },
          ].map((row) => (
            <div key={row.label}>
              <dt className="font-display text-sm font-light text-muted-foreground">{row.label}</dt>
              <dd className={cn(VALUE, "mt-1.5 text-xl sm:text-2xl")}>{row.value || "0"}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8">
        <div className="flex gap-2 rounded-xl border border-border/60 bg-muted/20 p-1">
          <button
            type="button"
            onClick={() => setTab("income")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-display text-sm font-light tracking-tight transition-colors sm:text-base",
              tab === "income"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FiArrowDownLeft className="text-emerald-600" size={18} aria-hidden />
            Income
            <MoneyAmount
              amount={incomeTotal}
              compact
              className="text-sm text-emerald-700 sm:text-base [&_span]:text-sm sm:[&_span]:text-base [&_span]:text-emerald-700"
            />
          </button>
          <button
            type="button"
            onClick={() => setTab("expenses")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-display text-sm font-light tracking-tight transition-colors sm:text-base",
              tab === "expenses"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FiArrowUpRight className="text-destructive" size={18} aria-hidden />
            Expenses
            <MoneyAmount
              amount={expenseTotal}
              compact
              className="text-sm text-destructive sm:text-base [&_span]:text-sm sm:[&_span]:text-base [&_span]:text-destructive"
            />
          </button>
        </div>

        <div className="mt-5">
          <h4 className={cn(VALUE, "text-xl sm:text-2xl")}>
            {tab === "income" ? "Income" : "Expenses"}
          </h4>

          {activeItems.length === 0 ? (
            <p className="mt-4 rounded-xl border border-border/60 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
              No transactions recorded yet
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60">
              {activeItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 bg-background px-3 py-3.5 sm:px-4"
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      tab === "income"
                        ? "bg-emerald-500/15 text-emerald-600"
                        : "bg-destructive/10 text-destructive",
                    )}
                    aria-hidden
                  >
                    {tab === "income" ? (
                      <FiArrowDownLeft size={18} />
                    ) : (
                      <FiArrowUpRight size={18} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base font-light tracking-tight">{item.label}</p>
                    {item.detail && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.detail}</p>
                    )}
                    {item.at && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {new Date(item.at).toLocaleString("en-RW")}
                      </p>
                    )}
                  </div>
                  <MoneyAmount
                    amount={item.amount}
                    compact
                    prefix={tab === "income" ? "+" : "−"}
                    className={cn(
                      "shrink-0 text-lg sm:text-xl [&_span]:text-lg sm:[&_span]:text-xl",
                      tab === "income"
                        ? "[&_span]:text-emerald-700"
                        : "[&_span]:text-destructive",
                    )}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}
