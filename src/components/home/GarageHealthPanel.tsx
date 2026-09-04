import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { HorizontalBar } from "@/components/charts/ChartPrimitives";

export type GarageHealth = {
  overall_score: number;
  status: string;
  // Battery / HV
  battery_percent: number;
  battery_soh_percent: number;
  battery_temp_c: number;
  battery_cell_diff_mv: number;
  charge_cycles: number;
  charging_status: string;
  range_km: number;
  // Powertrain
  motor_health_percent: number;
  inverter_health_percent: number;
  coolant_temp_c: number;
  // Chassis
  tyre_health_percent: number;
  tyre_pressure_fl_bar: number;
  tyre_pressure_fr_bar: number;
  tyre_pressure_rl_bar: number;
  tyre_pressure_rr_bar: number;
  brake_health_percent: number;
  brake_pad_percent: number;
  suspension_health_percent: number;
  // Electrical
  aux_12v_volt: number;
  fault_codes_count: number;
  active_warnings: string[];
  software_version: string;
  // Service
  odometer_km: number;
  last_service_at: string | null;
  next_service_due_km: number;
  last_diagnosis_at: string | null;
  inspection_passed: boolean | null;
};

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
  health: GarageHealth;
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

const CHARGE_STATUS: Record<string, string> = {
  unknown: "—",
  idle: "Idle",
  charging: "Charging",
  full: "Full",
  fault: "Fault",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-RW");
}

function MetricRows({
  rows,
}: {
  rows: { label: string; value: string; accent?: string }[];
}) {
  return (
    <dl className="mt-3 divide-y divide-border/60 border-t border-border/60">
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-3 py-2">
          <dt className="font-display text-sm font-light text-muted-foreground sm:text-base">
            {row.label}
          </dt>
          <dd
            className={cn(VALUE, "text-base sm:text-lg")}
            style={row.accent ? { color: row.accent } : undefined}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DiagnosisBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/15 px-4 py-4 sm:px-5">
      <p className={cn(VALUE, "text-lg sm:text-xl")}>{title}</p>
      {children}
    </div>
  );
}

/**
 * Full EV diagnosis + garage updates on the track page.
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
  const warnings = health.active_warnings ?? [];

  return (
    <Card className="border-border/70 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={cn(VALUE, "text-2xl sm:text-3xl")}>Car health & diagnosis</h3>
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

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <p className={cn(VALUE, "text-xl sm:text-2xl")}>Overall health</p>
          <p className={cn(VALUE, "mt-3 text-4xl sm:text-5xl")}>
            {health.overall_score}
            <span className="text-2xl text-muted-foreground sm:text-3xl">/100</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {HEALTH_STATUS[health.status] ?? health.status}
            {vehicle.garage_name ? ` · ${vehicle.garage_name}` : ""}
            {health.inspection_passed === true
              ? " · Inspection passed"
              : health.inspection_passed === false
                ? " · Inspection failed"
                : ""}
          </p>
          <div className="mt-6 space-y-4">
            <HorizontalBar
              label="Overall"
              value={health.overall_score}
              max={100}
              display={`${health.overall_score}%`}
              colorClass="bg-primary"
              size="lg"
            />
            <HorizontalBar
              label="Battery SOH"
              value={health.battery_soh_percent}
              max={100}
              display={`${health.battery_soh_percent}%`}
              colorClass="bg-volt"
              size="lg"
            />
            <HorizontalBar
              label="Motor"
              value={health.motor_health_percent}
              max={100}
              display={`${health.motor_health_percent}%`}
              colorClass="bg-foreground/50"
              size="lg"
            />
            <HorizontalBar
              label="Brakes"
              value={health.brake_health_percent}
              max={100}
              display={`${health.brake_health_percent}%`}
              colorClass="bg-foreground/35"
              size="lg"
            />
            <HorizontalBar
              label="Tyres"
              value={health.tyre_health_percent}
              max={100}
              display={`${health.tyre_health_percent}%`}
              colorClass="bg-foreground/25"
              size="lg"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DiagnosisBlock title="Battery & HV pack">
            <MetricRows
              rows={[
                { label: "Charge (SOC)", value: `${health.battery_percent}%` },
                { label: "Health (SOH)", value: `${health.battery_soh_percent}%` },
                { label: "Pack temp", value: `${health.battery_temp_c} °C` },
                { label: "Cell imbalance", value: `${health.battery_cell_diff_mv} mV` },
                { label: "Charge cycles", value: String(health.charge_cycles) },
                {
                  label: "Charging",
                  value: CHARGE_STATUS[health.charging_status] ?? health.charging_status,
                },
                { label: "Est. range", value: `${health.range_km} km` },
              ]}
            />
          </DiagnosisBlock>

          <DiagnosisBlock title="Powertrain">
            <MetricRows
              rows={[
                { label: "Motor health", value: `${health.motor_health_percent}%` },
                { label: "Inverter health", value: `${health.inverter_health_percent}%` },
                { label: "Coolant temp", value: `${health.coolant_temp_c} °C` },
              ]}
            />
          </DiagnosisBlock>

          <DiagnosisBlock title="Chassis">
            <MetricRows
              rows={[
                { label: "Tyre health", value: `${health.tyre_health_percent}%` },
                {
                  label: "Pressure FL / FR",
                  value: `${health.tyre_pressure_fl_bar} / ${health.tyre_pressure_fr_bar} bar`,
                },
                {
                  label: "Pressure RL / RR",
                  value: `${health.tyre_pressure_rl_bar} / ${health.tyre_pressure_rr_bar} bar`,
                },
                { label: "Brake health", value: `${health.brake_health_percent}%` },
                { label: "Brake pads", value: `${health.brake_pad_percent}%` },
                { label: "Suspension", value: `${health.suspension_health_percent}%` },
              ]}
            />
          </DiagnosisBlock>

          <DiagnosisBlock title="Electrical & faults">
            <MetricRows
              rows={[
                { label: "12V battery", value: `${health.aux_12v_volt} V` },
                {
                  label: "Fault codes (DTCs)",
                  value: String(health.fault_codes_count),
                  accent:
                    health.fault_codes_count > 0 ? "var(--destructive)" : undefined,
                },
                {
                  label: "Software",
                  value: health.software_version || "—",
                },
              ]}
            />
            {warnings.length > 0 && (
              <ul className="mt-3 space-y-1 border-t border-border/60 pt-3">
                {warnings.map((w) => (
                  <li key={w} className="text-sm text-destructive">
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </DiagnosisBlock>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border/50 px-4 py-4 sm:px-5">
        <p className={cn(VALUE, "text-lg sm:text-xl")}>Service & identity</p>
        <dl className="mt-3 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Odometer", value: `${health.odometer_km} km` },
            {
              label: "Next service due",
              value: health.next_service_due_km
                ? `${health.next_service_due_km} km`
                : "0 km",
            },
            { label: "Last service", value: fmtDate(health.last_service_at) },
            { label: "Last diagnosis", value: fmtDate(health.last_diagnosis_at) },
            { label: "VIN", value: vehicle.vin || "—" },
            { label: "Plate", value: vehicle.plate || "—" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-3 border-t border-border/60 py-2.5"
            >
              <dt className="font-display text-sm font-light text-muted-foreground">
                {row.label}
              </dt>
              <dd className={cn(VALUE, "text-base sm:text-lg")}>{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8 border-t border-border/60 pt-6">
        <div className="flex items-baseline justify-between gap-3">
          <p className={cn(VALUE, "text-xl sm:text-2xl")}>Recent garage updates</p>
          <span className={cn(VALUE, "text-xl")}>{updates.length}</span>
        </div>
        {updates.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No garage updates yet. Full diagnosis fields stay at 0 until the garage sends the
            first sync.
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
