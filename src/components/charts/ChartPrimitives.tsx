import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ChartSegment = { value: number; color: string; label: string };
export type ChartLegendItem = { value: string | number; color: string; label: string };

export function DonutChart({
  segments,
  size = 112,
  strokeWidth = 11,
  centerLabel,
  centerSub,
}: {
  segments: ChartSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel: string;
  centerSub?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let dashOffset = 0;
  /** Usable diameter inside the ring for labels */
  const hole = Math.max(36, size - strokeWidth * 2 - 8);
  const labelLen = String(centerLabel).length;
  const centerTextClass =
    hole < 56
      ? "text-base"
      : hole < 72
        ? labelLen > 4
          ? "text-lg"
          : "text-xl"
        : hole < 88
          ? labelLen > 4
            ? "text-xl"
            : "text-2xl"
          : labelLen > 4
            ? "text-2xl"
            : "text-3xl";

  return (
    <div className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.92 0.01 130)"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          if (seg.value <= 0) return null;
          const dash = (seg.value / total) * circumference;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-dashOffset}
              strokeLinecap="butt"
            />
          );
          dashOffset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center p-2">
        {(centerLabel || centerSub) && (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ width: hole, maxWidth: hole }}
          >
            {centerLabel ? (
              <span
                className={cn(
                  "font-display font-bold leading-none tracking-tight tabular-nums",
                  centerTextClass,
                )}
              >
                {centerLabel}
              </span>
            ) : null}
            {centerSub && (
              <span
                className={cn(
                  "w-full text-center font-medium uppercase leading-tight tracking-wide text-muted-foreground",
                  centerLabel ? "mt-1" : "",
                  hole < 72 ? "text-[0.6rem]" : "text-[0.65rem]",
                )}
              >
                {centerSub}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function HorizontalBar({
  label,
  value,
  max,
  colorClass,
  display,
  size = "md",
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
  display: string;
  size?: "md" | "lg";
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const large = size === "lg";
  return (
    <div>
      <div
        className={cn(
          "mb-2 flex items-baseline justify-between gap-3",
          large ? "text-base sm:text-lg" : "text-sm",
        )}
      >
        <span className={cn("text-foreground", large ? "font-semibold" : "font-medium")}>
          {label}
        </span>
        <span
          className={cn(
            "shrink-0 tabular-nums",
            large ? "font-semibold text-foreground" : "text-muted-foreground",
          )}
        >
          {display}
        </span>
      </div>
      <div className={cn("overflow-hidden rounded-full bg-muted", large ? "h-3.5" : "h-2.5")}>
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function StatRing({
  title,
  segments,
  centerLabel,
  centerSub,
  legend,
  size = "md",
}: {
  title: string;
  segments: ChartSegment[];
  centerLabel: string;
  centerSub?: string;
  legend: ChartLegendItem[];
  size?: "md" | "lg";
}) {
  const large = size === "lg";
  return (
    <Card
      className={cn(
        "flex h-full min-w-0 flex-col border-border/70",
        large ? "p-4 sm:p-5" : "p-4 sm:p-5",
      )}
    >
      <p
        className={cn(
          "font-display font-semibold tracking-tight text-foreground",
          large ? "text-base" : "text-eyebrow text-muted-foreground",
        )}
      >
        {title}
      </p>

      {large ? (
        <div className="mt-4 flex min-w-0 flex-1 flex-col items-center">
          <DonutChart
            segments={segments}
            centerLabel={centerLabel}
            centerSub={centerSub}
            size={118}
            strokeWidth={12}
          />
          <ul className="mt-4 w-full min-w-0 space-y-2">
            {legend.map((item) => (
              <li
                key={item.label}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-2 text-sm"
              >
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span className="min-w-0 leading-snug text-muted-foreground">{item.label}</span>
                <span className="max-w-[7.5rem] break-words text-right font-semibold leading-snug tabular-nums">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 flex min-w-0 items-center gap-4">
          <DonutChart
            segments={segments}
            centerLabel={centerLabel}
            centerSub={centerSub}
            size={104}
            strokeWidth={11}
          />
          <ul className="min-w-0 flex-1 space-y-2">
            {legend.map((item) => (
              <li key={item.label} className="flex min-w-0 items-start gap-2 text-sm">
                <span
                  className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{item.label}</span>
                <span className="max-w-[5.5rem] shrink-0 break-words text-right font-medium tabular-nums leading-snug">
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export type HistogramBar = {
  label: string;
  value: number;
  color?: string;
  subLabel?: string;
};

/** Vertical histogram / column chart */
export function HistogramChart({
  bars,
  height = 200,
  valueFormatter,
}: {
  bars: HistogramBar[];
  height?: number;
  valueFormatter?: (n: number) => string;
}) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const fmt = valueFormatter ?? ((n: number) => String(n));

  return (
    <div className="w-full min-w-0">
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {bars.map((bar) => {
          const pct = Math.max(4, Math.round((bar.value / max) * 100));
          return (
            <div key={bar.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <span className="font-display text-sm font-bold tabular-nums sm:text-base">
                {fmt(bar.value)}
              </span>
              <div className="relative flex w-full flex-1 items-end justify-center">
                <div
                  className="w-full max-w-[3.5rem] rounded-t-md transition-all"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: bar.color || "var(--primary)",
                    minHeight: bar.value > 0 ? 8 : 2,
                  }}
                  title={`${bar.label}: ${fmt(bar.value)}`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2 sm:gap-3 border-t border-border/60 pt-3">
        {bars.map((bar) => (
          <div key={`${bar.label}-cap`} className="min-w-0 flex-1 text-center">
            <p className="truncate text-xs font-medium sm:text-sm">{bar.label}</p>
            {bar.subLabel && (
              <p className="truncate text-[11px] text-muted-foreground">{bar.subLabel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type GroupedBarSeries = {
  key: string;
  label: string;
  color: string;
};

export type GroupedBarGroup = {
  label: string;
  values: Record<string, number>;
};

/** Grouped vertical bars (e.g. filled vs waiting per cohort) */
export function GroupedHistogram({
  groups,
  series,
  height = 220,
}: {
  groups: GroupedBarGroup[];
  series: GroupedBarSeries[];
  height?: number;
}) {
  const max = Math.max(
    1,
    ...groups.flatMap((g) => series.map((s) => g.values[s.key] ?? 0)),
  );

  return (
    <div className="w-full min-w-0">
      <div className="mb-4 flex flex-wrap gap-4">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-3 sm:gap-4" style={{ height }}>
        {groups.map((group) => (
          <div key={group.label} className="flex min-w-0 flex-1 items-end justify-center gap-1">
            {series.map((s) => {
              const value = group.values[s.key] ?? 0;
              const pct = Math.max(value > 0 ? 6 : 2, Math.round((value / max) * 100));
              return (
                <div key={s.key} className="flex w-full max-w-[1.75rem] flex-col items-center gap-1">
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {value}
                  </span>
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${(pct / 100) * (height - 28)}px`,
                      backgroundColor: s.color,
                      minHeight: value > 0 ? 6 : 2,
                    }}
                    title={`${group.label} · ${s.label}: ${value}`}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-3 sm:gap-4 border-t border-border/60 pt-3">
        {groups.map((group) => (
          <p key={group.label} className="min-w-0 flex-1 truncate text-center text-xs font-medium sm:text-sm">
            {group.label}
          </p>
        ))}
      </div>
    </div>
  );
}
