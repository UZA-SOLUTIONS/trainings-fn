import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { HorizontalBar } from "@/components/charts/ChartPrimitives";

export type GaragePreview = {
  status: string;
  live: boolean;
  message: string;
  uza_id: string | null;
  vehicle: {
    plate: string;
    vin: string;
    model: string;
    garage_id: string;
    garage_name: string;
  };
  health: {
    overall_score: number;
    battery_percent: number;
    range_km: number;
    odometer_km: number;
    tyre_health_percent: number;
    last_service_at: string | null;
    next_service_due_km: number;
    status: string;
  };
  updates: Array<{
    id: string;
    at: string | null;
    type: string;
    title: string;
    detail: string;
    severity: "info" | "watch" | "critical" | string;
    source: string;
  }>;
  last_synced_at: string | null;
  endpoints: Array<{
    method: string;
    path: string;
    audience: string[];
    purpose: string;
  }>;
};

const VALUE = "font-display font-light tracking-tight tabular-nums text-foreground";

const HEALTH_STATUS: Record<string, string> = {
  unknown: "Awaiting garage",
  healthy: "Healthy",
  attention: "Needs attention",
  critical: "Critical",
  in_service: "In service",
};

/**
 * Vehicle health + garage updates on the track page.
 * Numbers stay at 0 until the garage syncs live telemetry.
 */
export function GarageHealthPanel({
  garage,
  evOfChoice,
}: {
  garage: GaragePreview;
  evOfChoice?: string | null;
}) {
  const { health, vehicle, updates } = garage;
  const model = (evOfChoice || vehicle.model || "").trim();

  return (
    <Card className="border-border/70 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={cn(VALUE, "text-2xl sm:text-3xl")}>Car health & updates</h3>
          <p className="mt-2 font-display text-base font-light tracking-tight text-foreground sm:text-lg">
            EV of choice: {model || "Not selected yet"}
            {vehicle.plate ? ` · ${vehicle.plate}` : ""}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {garage.message}
          </p>
        </div>
        <span className="rounded-full bg-volt/15 px-3 py-1 font-display text-xs font-light uppercase tracking-wide text-foreground">
          {garage.live ? "Live from garage" : "Awaiting garage"}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <p className={cn(VALUE, "text-xl sm:text-2xl")}>Health score</p>
          <p className={cn(VALUE, "mt-3 text-4xl sm:text-5xl")}>
            {health.overall_score}
            <span className="text-2xl text-muted-foreground sm:text-3xl">/100</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {HEALTH_STATUS[health.status] ?? health.status}
            {vehicle.garage_name ? ` · ${vehicle.garage_name}` : ""}
          </p>
          <div className="mt-6 space-y-5">
            <HorizontalBar
              label="Overall"
              value={health.overall_score}
              max={100}
              display={`${health.overall_score}%`}
              colorClass="bg-primary"
              size="lg"
            />
            <HorizontalBar
              label="Battery"
              value={health.battery_percent}
              max={100}
              display={`${health.battery_percent}%`}
              colorClass="bg-volt"
              size="lg"
            />
            <HorizontalBar
              label="Tyres"
              value={health.tyre_health_percent}
              max={100}
              display={`${health.tyre_health_percent}%`}
              colorClass="bg-foreground/40"
              size="lg"
            />
          </div>
        </div>

        <div>
          <p className={cn(VALUE, "text-xl sm:text-2xl")}>Vehicle numbers</p>
          <dl className="mt-4 divide-y divide-border/60 border-t border-border/60">
            {[
              { label: "Battery", value: `${health.battery_percent}%` },
              { label: "Range", value: `${health.range_km} km` },
              { label: "Odometer", value: `${health.odometer_km} km` },
              {
                label: "Next service due",
                value: health.next_service_due_km
                  ? `${health.next_service_due_km} km`
                  : "0 km",
              },
              {
                label: "Last service",
                value: health.last_service_at
                  ? new Date(health.last_service_at).toLocaleDateString("en-RW")
                  : "—",
              },
              { label: "VIN", value: vehicle.vin || "—" },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3 py-2.5">
                <dt className="font-display font-light text-muted-foreground">{row.label}</dt>
                <dd className={cn(VALUE, "text-lg sm:text-xl")}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-8 border-t border-border/60 pt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className={cn(VALUE, "text-xl sm:text-2xl")}>Recent garage updates</p>
          <span className={cn(VALUE, "text-xl")}>{updates.length}</span>
        </div>
        {updates.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No garage updates yet. Numbers stay at 0 until the garage sends the first sync.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {updates.map((u) => (
              <li
                key={u.id || `${u.at}-${u.title}`}
                className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border/40 bg-background/80 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-light tracking-tight sm:text-base">
                    {u.title}
                  </p>
                  {u.detail && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{u.detail}</p>
                  )}
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {u.type}
                    {u.at ? ` · ${new Date(u.at).toLocaleString("en-RW")}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-display text-xs font-light uppercase tracking-wide",
                    u.severity === "critical" && "text-destructive",
                    u.severity === "watch" && "text-foreground",
                    u.severity === "info" && "text-muted-foreground",
                  )}
                >
                  {u.severity}
                </span>
              </li>
            ))}
          </ul>
        )}
        {garage.last_synced_at && (
          <p className="mt-4 text-xs text-muted-foreground">
            Last synced {new Date(garage.last_synced_at).toLocaleString("en-RW")}
          </p>
        )}
      </div>
    </Card>
  );
}
