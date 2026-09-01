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
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-2xl font-bold leading-none tracking-tight">{centerLabel}</span>
        {centerSub && (
          <span className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">{centerSub}</span>
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
}: {
  label: string;
  value: number;
  max: number;
  colorClass: string;
  display: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="shrink-0 text-muted-foreground">{display}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
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
}: {
  title: string;
  segments: ChartSegment[];
  centerLabel: string;
  centerSub?: string;
  legend: ChartLegendItem[];
}) {
  return (
    <Card className="border-border/70 p-4 sm:p-5">
      <p className="text-eyebrow text-muted-foreground">{title}</p>
      <div className="mt-4 flex items-center gap-4">
        <DonutChart segments={segments} centerLabel={centerLabel} centerSub={centerSub} />
        <ul className="min-w-0 flex-1 space-y-2">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              <span className="truncate text-muted-foreground">{item.label}</span>
              <span className="ml-auto font-medium tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
