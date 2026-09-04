import { jsPDF } from "jspdf";
import type { CandidateTrackView, TrackMilestoneStatus } from "@/services/candidateService";
import {
  resolveTrackFinancing,
  resolveTrackGarage,
  resolveTrackWallet,
} from "@/components/home/trackFallbacks";
import { formatRwf } from "@/utils/financing";

/** Match page tokens (light theme primary / volt / destructive). */
const INK = { r: 32, g: 36, b: 34 };
const MUTED = { r: 110, g: 118, b: 112 };
const LINE = { r: 220, g: 224, b: 218 };
const CARD = { r: 255, g: 255, b: 255 };
const PAGE = { r: 248, g: 249, b: 247 };
const PRIMARY = { r: 30, g: 90, b: 62 };
const VOLT = { r: 168, g: 196, b: 48 };
const DANGER = { r: 180, g: 55, b: 45 };
const TRACK = { r: 210, g: 216, b: 208 };
const SOFT = { r: 236, g: 240, b: 234 };

type Rgb = { r: number; g: number; b: number };

const STATUS_LABELS: Record<string, string> = {
  enrolled: "Enrolled",
  waitlisted: "Waiting list",
  rejected: "Not accepted",
  withdrawn: "Withdrawn",
  graduated: "Graduated",
};

const TRAINING_LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Did not pass",
};

function milestoneBarValue(status: TrackMilestoneStatus) {
  if (status === "complete") return 100;
  if (status === "in_progress" || status === "in_review") return 55;
  if (status === "action_required" || status === "blocked") return 25;
  return 8;
}

function milestoneColor(status: TrackMilestoneStatus): Rgb {
  if (status === "complete") return PRIMARY;
  if (status === "in_progress" || status === "in_review") return VOLT;
  if (status === "action_required" || status === "blocked") return DANGER;
  return TRACK;
}

function trainingPctOf(track: CandidateTrackView) {
  const t = track.training;
  if (t.status === "completed") return 100;
  if (t.status === "not_started") return 0;
  const scores = [t.attendance_percentage, t.exam_score].filter(
    (v): v is number => v != null,
  );
  if (!scores.length) return t.status === "in_progress" ? 35 : 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function money(n: number | null | undefined) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  return formatRwf(Number(n), { compact: true });
}

class PdfPage {
  doc: jsPDF;
  pageW: number;
  pageH: number;
  m = 14;
  y = 14;
  w: number;
  page = 1;
  code: string;

  constructor(code: string) {
    this.doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    this.pageW = this.doc.internal.pageSize.getWidth();
    this.pageH = this.doc.internal.pageSize.getHeight();
    this.w = this.pageW - this.m * 2;
    this.code = code;
    this.fill(PAGE);
    this.doc.rect(0, 0, this.pageW, this.pageH, "F");
  }

  fill(c: Rgb) {
    this.doc.setFillColor(c.r, c.g, c.b);
  }
  stroke(c: Rgb) {
    this.doc.setDrawColor(c.r, c.g, c.b);
  }
  ink(c: Rgb = INK) {
    this.doc.setTextColor(c.r, c.g, c.b);
  }

  ensure(h: number) {
    if (this.y + h <= this.pageH - 14) return;
    this.foot();
    this.doc.addPage();
    this.page += 1;
    this.fill(PAGE);
    this.doc.rect(0, 0, this.pageW, this.pageH, "F");
    this.y = this.m;
  }

  foot() {
    this.stroke(LINE);
    this.doc.setLineWidth(0.25);
    this.doc.line(this.m, this.pageH - 10, this.pageW - this.m, this.pageH - 10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.ink(MUTED);
    this.doc.text(this.code, this.m, this.pageH - 5.5);
    this.doc.text(`${this.page}`, this.pageW - this.m, this.pageH - 5.5, { align: "right" });
  }

  title(text: string, size = 16) {
    this.ensure(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(size);
    this.ink(INK);
    this.doc.text(text, this.m, this.y);
    this.y += size * 0.45 + 2;
  }

  muted(text: string, size = 9) {
    this.ensure(6);
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(size);
    this.ink(MUTED);
    const lines = this.doc.splitTextToSize(text, this.w);
    this.doc.text(lines, this.m, this.y);
    this.y += lines.length * (size * 0.4) + 2;
  }

  /** Section panel — flat fill only (no border / shadow). */
  cardStart(height: number): { x: number; y: number; w: number } {
    this.ensure(height + 6);
    const box = { x: this.m, y: this.y, w: this.w };
    this.fill(CARD);
    this.doc.rect(box.x, box.y, box.w, height, "F");
    return box;
  }

  cardEnd(startY: number, height: number) {
    this.y = startY + height + 6;
  }

  /** Donut matching AnalysisKpi on the page. */
  donut(
    cx: number,
    cy: number,
    r: number,
    segments: { value: number; color: Rgb }[],
    center?: string,
  ) {
    const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0) || 1;
    let angle = -Math.PI / 2;
    const thickness = Math.max(1.8, r * 0.28);
    segments.forEach((seg) => {
      const sweep = (Math.max(0, seg.value) / total) * Math.PI * 2;
      if (sweep <= 0) return;
      this.drawArc(cx, cy, r, angle, angle + sweep, seg.color, thickness);
      angle += sweep;
    });
    this.fill(CARD);
    this.doc.circle(cx, cy, Math.max(0.5, r - thickness - 0.3), "F");
    if (center) {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(8);
      this.ink(INK);
      this.doc.text(center, cx, cy + 1, { align: "center" });
    }
  }

  drawArc(
    cx: number,
    cy: number,
    r: number,
    a0: number,
    a1: number,
    color: Rgb,
    thickness: number,
  ) {
    const steps = Math.max(10, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 56));
    this.stroke(color);
    this.doc.setLineWidth(thickness);
    this.doc.setLineCap("butt");
    for (let i = 0; i < steps; i++) {
      const t0 = a0 + ((a1 - a0) * i) / steps;
      const t1 = a0 + ((a1 - a0) * (i + 1)) / steps;
      const rr = r - thickness / 2;
      this.doc.line(
        cx + Math.cos(t0) * rr,
        cy + Math.sin(t0) * rr,
        cx + Math.cos(t1) * rr,
        cy + Math.sin(t1) * rr,
      );
    }
  }

  hBar(x: number, y: number, w: number, label: string, value: number, max: number, color: Rgb) {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.ink(MUTED);
    this.doc.text(label, x, y);
    this.doc.text(`${Math.round(value)}%`, x + w, y, { align: "right" });
    const trackY = y + 2.2;
    this.fill(SOFT);
    this.doc.rect(x, trackY, w, 3.5, "F");
    const fillW = Math.max(0, Math.min(w, (Math.max(0, value) / (max || 1)) * w));
    if (fillW > 0.4) {
      this.fill(color);
      this.doc.rect(x, trackY, fillW, 3.5, "F");
    }
  }

  /**
   * Vertical bars with reserved label band under the plot so labels never collide with bars.
   */
  histogram(
    x: number,
    y: number,
    w: number,
    h: number,
    bars: { label: string; value: number; color: Rgb; sub?: string }[],
  ) {
    if (!bars.length) return;
    const labelBand = 8;
    const plotH = Math.max(12, h - labelBand);
    const gap = Math.min(4, w / (bars.length * 4));
    const slot = (w - gap * Math.max(0, bars.length - 1)) / bars.length;
    const max = Math.max(...bars.map((b) => b.value), 1);

    bars.forEach((b, i) => {
      const bx = x + i * (slot + gap);
      const barW = Math.max(3, slot * 0.72);
      const barX = bx + (slot - barW) / 2;
      const bh = Math.max(2, (b.value / max) * (plotH - 2));
      const by = y + plotH - bh;
      this.fill(b.color);
      this.doc.rect(barX, by, barW, bh, "F");

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7);
      this.ink(MUTED);
      const label = this.doc.splitTextToSize(b.label, slot - 1)[0] || b.label;
      this.doc.text(label, bx + slot / 2, y + plotH + 5, { align: "center" });
    });
  }

  row(x: number, y: number, w: number, label: string, value: string, accent?: Rgb) {
    const labelW = w * 0.58;
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.ink(MUTED);
    const lab = this.doc.splitTextToSize(label, labelW)[0] || label;
    this.doc.text(lab, x, y);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.ink(accent || INK);
    this.doc.text(value, x + w, y, { align: "right" });
  }

  kpiCard(
    x: number,
    y: number,
    w: number,
    h: number,
    opts: {
      title: string;
      value: string;
      unit?: string;
      segments: { value: number; color: Rgb }[];
      rows: { label: string; value: string; accent?: Rgb }[];
    },
  ) {
    // Flat panel — no stroke/shadow
    this.fill(CARD);
    this.doc.rect(x, y, w, h, "F");

    const pad = 3.5;
    const donutR = Math.min(8, w * 0.14);
    const textRight = w - pad * 2 - donutR * 2 - 4;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(6.5);
    this.ink(MUTED);
    this.doc.text(opts.title.toUpperCase(), x + pad, y + 5);

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.ink(INK);
    const valueLines = this.doc.splitTextToSize(opts.value, Math.max(18, textRight));
    this.doc.text(valueLines[0], x + pad, y + 13);
    if (opts.unit) {
      const vw = this.doc.getTextWidth(valueLines[0]);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.ink(MUTED);
      this.doc.text(opts.unit, x + pad + vw + 1.2, y + 12.5);
    }

    // Chart sits in its own corner, clear of value text
    this.donut(x + w - pad - donutR, y + 11, donutR, opts.segments);

    const rowTop = y + 22;
    const rowH = (h - 24) / Math.max(opts.rows.length, 1);
    opts.rows.forEach((r, i) => {
      const ry = rowTop + i * rowH;
      this.stroke(SOFT);
      this.doc.setLineWidth(0.3);
      this.doc.line(x + pad, ry - 2.5, x + w - pad, ry - 2.5);
      this.row(x + pad, ry, w - pad * 2, r.label, r.value, r.accent);
    });
  }
}

/**
 * PDF mirrors the track page: same section titles, KPI cards with donuts,
 * garage bars, financing + milestone histograms — not a “dossier” layout.
 */
export function downloadTrackReportPdf(track: CandidateTrackView) {
  const financing = resolveTrackFinancing(track);
  const wallet = resolveTrackWallet(track);
  const garage = resolveTrackGarage(track);
  const health = garage.health;
  const p = new PdfPage(track.candidate_code);
  const { doc } = p;

  const isCertified =
    track.training.status === "completed" || track.status === "graduated";
  const trainingPct = trainingPctOf(track);

  const depositOffered = financing.deposit_offered_rwf;
  const depositTen = financing.deposit_ten_percent_rwf;
  const remainingToTen = financing.remaining_to_ten_percent_rwf;
  const bankPays = financing.bank_finance_rwf;
  const vehiclePrice = financing.target_vehicle_price_rwf;
  const depositPct = financing.deposit_pct;

  const docsReceived = track.documents.filter((d) => d.complete).length;
  const docsNeeded = track.documents.filter((d) => !d.complete && d.required).length;
  const docsOptional = track.documents.filter((d) => !d.complete && !d.required).length;

  const completed = track.milestones.filter((m) => m.status === "complete").length;
  const active = track.milestones.filter((m) =>
    ["in_progress", "in_review"].includes(m.status),
  ).length;
  const action = track.milestones.filter((m) =>
    ["action_required", "blocked"].includes(m.status),
  ).length;
  const pending = track.milestones.length - completed - active - action;
  const milestonePct = track.milestones.length
    ? Math.round((completed / track.milestones.length) * 100)
    : 0;

  // —— Header (same fields as track card) ——
  p.title(track.full_name, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  p.ink(PRIMARY);
  doc.text(track.candidate_code, p.m, p.y);
  p.y += 6;

  p.muted(
    [
      isCertified ? "Certified" : "Not certified",
      STATUS_LABELS[track.status] ?? track.status,
      `Current stage: ${track.current_stage}`,
    ].join("  ·  "),
  );

  const meta: { label: string; value: string }[] = [];
  if (track.cohort) {
    meta.push(
      { label: "Cohort", value: track.cohort.name },
      { label: "Start", value: track.cohort.start_date || "To be confirmed" },
      { label: "Location", value: track.cohort.location || "TBC" },
      { label: "Partner bank", value: track.cohort.partner_bank || "—" },
    );
  }
  meta.push({
    label: "EV of choice",
    value: financing.target_vehicle_name?.trim() || "Not selected yet",
  });
  meta.push({ label: "Applied", value: new Date(track.applied_at).toLocaleDateString("en-GB") });

  const metaH = 8 + Math.ceil(meta.length / 3) * 10;
  const metaBox = p.cardStart(metaH);
  meta.forEach((row, i) => {
    const col = i % 3;
    const rowi = Math.floor(i / 3);
    const cx = metaBox.x + 4 + col * ((metaBox.w - 8) / 3);
    const cy = metaBox.y + 6 + rowi * 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    p.ink(MUTED);
    doc.text(row.label.toUpperCase(), cx, cy);
    doc.setFontSize(9);
    p.ink(INK);
    const lines = doc.splitTextToSize(row.value, (metaBox.w - 12) / 3);
    doc.text(lines[0], cx, cy + 4);
  });
  p.cardEnd(metaBox.y, metaH);

  // —— Wallet (page panel) ——
  p.title("Your UZA wallet", 13);
  p.muted(`EV of choice: ${financing.target_vehicle_name?.trim() || "Not selected yet"}`);
  const wh = 28;
  const wb = p.cardStart(wh);
  const rows = [
    { label: "Available", value: money(wallet.balances.available_rwf) },
    { label: "Savings locked", value: money(wallet.balances.savings_locked_rwf) },
    { label: "Commission owed", value: money(wallet.balances.commission_owed_rwf) },
  ];
  rows.forEach((r, i) => {
    p.row(wb.x + 5, wb.y + 8 + i * 7, wb.w - 10, r.label, r.value);
  });
  p.cardEnd(wb.y, wh);

  const appH = 16;
  const ab = p.cardStart(appH);
  [
    ["MTN MoMo", wallet.app_numbers?.momo || "0"],
    ["Airtel Money", wallet.app_numbers?.airtel || "0"],
    ["UZA wallet", wallet.app_numbers?.uza_wallet || "0"],
    ["Linked phone", wallet.app_numbers?.linked_phone || track.phone || "0"],
  ].forEach((pair, i) => {
    const cx = ab.x + 4 + (i % 4) * ((ab.w - 8) / 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    p.ink(MUTED);
    doc.text(pair[0], cx, ab.y + 6);
    doc.setFontSize(10);
    p.ink(INK);
    doc.text(pair[1], cx, ab.y + 11);
  });
  p.cardEnd(ab.y, appH);

  // —— Garage: bars full width, then metrics (no bordered nested boxes) ——
  p.title("Car health & diagnosis", 13);
  p.muted(
    `EV of choice: ${garage.vehicle.model || financing.target_vehicle_name || "Not selected yet"}${
      garage.vehicle.plate ? ` · ${garage.vehicle.plate}` : ""
    }  ·  ${garage.live ? "Live from garage" : "Awaiting garage"}`,
  );

  const gh = 92;
  const gb = p.cardStart(gh);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  p.ink(INK);
  doc.text("Overall health", gb.x + 6, gb.y + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  p.ink(INK);
  doc.text(String(health.overall_score), gb.x + 6, gb.y + 18);
  const scoreW = doc.getTextWidth(String(health.overall_score));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  p.ink(MUTED);
  doc.text("/100", gb.x + 7 + scoreW, gb.y + 17);

  const barX = gb.x + 6;
  const barW = gb.w - 12;
  p.hBar(barX, gb.y + 24, barW, "Overall", health.overall_score, 100, PRIMARY);
  p.hBar(barX, gb.y + 34, barW, "Battery SOH", health.battery_soh_percent, 100, VOLT);
  p.hBar(barX, gb.y + 44, barW, "Motor", health.motor_health_percent, 100, { r: 90, g: 96, b: 90 });
  p.hBar(barX, gb.y + 54, barW, "Brakes", health.brake_health_percent, 100, { r: 120, g: 124, b: 118 });
  p.hBar(barX, gb.y + 64, barW, "Tyres", health.tyre_health_percent, 100, { r: 150, g: 154, b: 148 });

  const metricCols: [string, string][][] = [
    [
      ["SOC", `${health.battery_percent}%`],
      ["SOH", `${health.battery_soh_percent}%`],
      ["Range", `${health.range_km} km`],
    ],
    [
      ["Motor", `${health.motor_health_percent}%`],
      ["Inverter", `${health.inverter_health_percent}%`],
      ["Coolant", `${health.coolant_temp_c} °C`],
    ],
    [
      ["Tyres", `${health.tyre_health_percent}%`],
      ["Brakes", `${health.brake_health_percent}%`],
      ["Pads", `${health.brake_pad_percent}%`],
    ],
    [
      ["12V", `${health.aux_12v_volt} V`],
      ["Faults", String(health.fault_codes_count)],
      ["Odometer", `${health.odometer_km} km`],
    ],
  ];
  const colW = (gb.w - 18) / 4;
  metricCols.forEach((rows, i) => {
    const cx = gb.x + 6 + i * (colW + 2);
    rows.forEach((r, ri) => {
      p.row(cx, gb.y + 76 + ri * 5, colW - 2, r[0], r[1]);
    });
  });
  p.cardEnd(gb.y, gh);

  // —— Status at a glance (KPI grid with donuts) ——
  p.title("Status at a glance", 13);
  p.ensure(58);
  const kpiY = p.y;
  const kpiGap = 4;
  const kpiW = (p.w - kpiGap * 2) / 3;
  const kpiH = 52;
  const walletAvail = wallet.balances.available_rwf ?? 0;

  p.kpiCard(p.m, kpiY, kpiW, kpiH, {
    title: "Wallet app",
    value: String(walletAvail),
    unit: "RWF",
    segments: [{ value: 1, color: TRACK }],
    rows: [
      { label: "Available", value: money(walletAvail) },
      { label: "Savings locked", value: money(wallet.balances.savings_locked_rwf) },
      { label: "Commission owed", value: money(wallet.balances.commission_owed_rwf) },
    ],
  });
  p.kpiCard(p.m + kpiW + kpiGap, kpiY, kpiW, kpiH, {
    title: "Garage health",
    value: String(health.overall_score),
    unit: "/100",
    segments: [
      { value: Math.max(health.overall_score, 1), color: VOLT },
      { value: Math.max(100 - health.overall_score, 1), color: TRACK },
    ],
    rows: [
      { label: "Battery SOH", value: `${health.battery_soh_percent}%` },
      { label: "Motor", value: `${health.motor_health_percent}%` },
      { label: "Faults", value: String(health.fault_codes_count) },
    ],
  });
  p.kpiCard(p.m + (kpiW + kpiGap) * 2, kpiY, kpiW, kpiH, {
    title: "Programme journey",
    value: String(milestonePct),
    unit: "%",
    segments: [
      { value: completed || 0.001, color: PRIMARY },
      { value: active || 0.001, color: VOLT },
      { value: action || 0.001, color: DANGER },
      { value: pending || 0.001, color: TRACK },
    ],
    rows: [
      { label: "Complete", value: String(completed), accent: PRIMARY },
      { label: "In progress", value: String(active), accent: VOLT },
      { label: "Pending", value: String(pending) },
    ],
  });
  p.y = kpiY + kpiH + 6;

  p.ensure(58);
  const kpi2Y = p.y;
  const kpi2Gap = 3.5;
  const kpi2W = (p.w - kpi2Gap * 3) / 4;

  p.kpiCard(p.m, kpi2Y, kpi2W, kpiH, {
    title: "Document file",
    value: String(track.documents_summary.percent),
    unit: "%",
    segments: [
      { value: docsReceived || 0.001, color: PRIMARY },
      { value: docsNeeded || 0.001, color: DANGER },
      { value: docsOptional || 0.001, color: TRACK },
    ],
    rows: [
      { label: "Received", value: String(docsReceived), accent: PRIMARY },
      { label: "Still needed", value: String(docsNeeded), accent: DANGER },
      { label: "Optional left", value: String(docsOptional) },
    ],
  });

  const depositHero =
    depositTen > 0 && remainingToTen > 0
      ? money(remainingToTen).replace(" RWF", "")
      : depositTen > 0
        ? String(depositPct)
        : "—";
  const depositUnit = depositTen > 0 && remainingToTen > 0 ? "RWF" : depositTen > 0 ? "%" : undefined;

  p.kpiCard(p.m + kpi2W + kpi2Gap, kpi2Y, kpi2W, kpiH, {
    title: "Deposit readiness",
    value: depositHero,
    unit: depositUnit,
    segments: [
      { value: Math.min(depositOffered, depositTen || depositOffered || 1), color: PRIMARY },
      { value: remainingToTen || 0.0001, color: DANGER },
    ],
    rows: [
      { label: "Offered", value: money(depositOffered), accent: PRIMARY },
      { label: "10% of car price", value: money(depositTen) },
      {
        label: remainingToTen > 0 ? "Left to pay" : "Fully covered",
        value: money(remainingToTen),
        accent: remainingToTen > 0 ? DANGER : PRIMARY,
      },
    ],
  });

  p.kpiCard(p.m + (kpi2W + kpi2Gap) * 2, kpi2Y, kpi2W, kpiH, {
    title: "Bank financing",
    value: bankPays ? money(bankPays).replace(" RWF", "") : "—",
    unit: bankPays ? "RWF" : undefined,
    segments: [
      { value: depositOffered || 1, color: PRIMARY },
      { value: bankPays || 1, color: VOLT },
    ],
    rows: [
      { label: "Vehicle price", value: money(vehiclePrice) },
      { label: "Candidate offered", value: money(depositOffered), accent: PRIMARY },
      { label: "Bank pays (remaining)", value: money(bankPays), accent: VOLT },
    ],
  });

  p.kpiCard(p.m + (kpi2W + kpi2Gap) * 3, kpi2Y, kpi2W, kpiH, {
    title: "Training readiness",
    value: String(trainingPct),
    unit: "%",
    segments: [
      { value: Math.max(trainingPct, 1), color: VOLT },
      { value: Math.max(100 - trainingPct, 1), color: TRACK },
    ],
    rows: [
      {
        label: "Attendance",
        value:
          track.training.attendance_percentage != null
            ? `${track.training.attendance_percentage}%`
            : "—",
        accent: VOLT,
      },
      {
        label: "Exam score",
        value: track.training.exam_score != null ? `${track.training.exam_score}%` : "—",
        accent: PRIMARY,
      },
      {
        label: "Status",
        value: TRAINING_LABELS[track.training.status] ?? track.training.status,
      },
    ],
  });
  p.y = kpi2Y + kpiH + 8;

  // —— Milestone timeline: tall chart, labels under bars ——
  p.title("Milestone timeline", 13);
  p.muted(`${completed}/${track.milestones.length} stages complete · ${milestonePct}% of programme journey`);
  const mh = 58;
  const mb = p.cardStart(mh);
  p.histogram(
    mb.x + 8,
    mb.y + 6,
    mb.w - 16,
    mh - 10,
    track.milestones.map((m, i) => ({
      label: String(i + 1).padStart(2, "0"),
      value: milestoneBarValue(m.status),
      color: milestoneColor(m.status),
      sub: m.label,
    })),
  );
  p.cardEnd(mb.y, mh);

  // —— Financing: figures row, then full-width chart ——
  p.title("Financing breakdown", 13);
  p.muted(
    [
      financing.target_vehicle_name
        ? `EV of choice · ${financing.target_vehicle_name}`
        : "Vehicle financing",
      vehiclePrice > 0 ? money(vehiclePrice) : null,
      "bank pays price − contribution",
    ]
      .filter(Boolean)
      .join(" · "),
  );

  const fh = 72;
  const fb = p.cardStart(fh);
  const boxW = (fb.w - 20) / 3;
  const finCards: { label: string; value: string; color: Rgb }[] = [
    { label: "Deposit offered", value: money(depositOffered), color: PRIMARY },
    {
      label: "Remaining to 10%",
      value: money(remainingToTen),
      color: remainingToTen > 0 ? DANGER : PRIMARY,
    },
    { label: "Bank pays (remaining)", value: money(bankPays), color: INK },
  ];
  finCards.forEach((c, i) => {
    const bx = fb.x + 6 + i * (boxW + 4);
    p.fill(SOFT);
    doc.rect(bx, fb.y + 5, boxW, 16, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    p.ink(MUTED);
    doc.text(c.label, bx + 3, fb.y + 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    p.ink(c.color);
    doc.text(c.value, bx + 3, fb.y + 17);
  });

  p.histogram(fb.x + 8, fb.y + 26, fb.w - 16, 42, [
    { label: "Vehicle", value: vehiclePrice || 1, color: { r: 55, g: 72, b: 58 } },
    { label: "Offered", value: depositOffered || 1, color: PRIMARY },
    { label: "To 10%", value: remainingToTen || 1, color: DANGER },
    { label: "Bank", value: bankPays || 1, color: VOLT },
  ]);
  p.cardEnd(fb.y, fh);

  // —— Optional docs list (page style) ——
  if (track.documents.length) {
    p.title("Documents", 13);
    const dh = Math.min(8 + track.documents.length * 6, 70);
    p.ensure(dh + 4);
    const db = p.cardStart(dh);
    track.documents.forEach((d, i) => {
      const dy = db.y + 6 + i * 6;
      if (dy > db.y + dh - 3) return;
      p.row(
        db.x + 5,
        dy,
        db.w - 10,
        d.label + (d.required ? "" : " (optional)"),
        d.complete ? "On file" : "Outstanding",
        d.complete ? PRIMARY : DANGER,
      );
    });
    p.cardEnd(db.y, dh);
  }

  p.foot();

  const safe = track.full_name.replace(/[^\w\-]+/g, "_").slice(0, 40);
  doc.save(`UZA_Track_${track.candidate_code}_${safe}.pdf`);
}
