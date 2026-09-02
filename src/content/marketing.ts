import type { PayOption } from "@/components/financing/FinancingCalculator";

export const PROGRAMME_STEPS = [
  {
    n: "01",
    title: "Register and get a driver ID",
    body: "Every applicant receives a permanent UZA ID. Everything after this — training, documents, financing, the vehicle itself — hangs off that one number.",
  },
  {
    n: "02",
    title: "Complete training",
    body: "Graduates move into a verified cohort folder that partner banks can review directly. Some cohorts are pre-qualified for a specific institution.",
  },
  {
    n: "03",
    title: "Upload documents, guided",
    body: "Each bank publishes its own checklist. The system walks the driver item by item and refuses to submit an incomplete file, so nothing is skipped.",
  },
  {
    n: "04",
    title: "Choose how you are financed",
    body: "Declare your deposit. If you fall short of the bank's requirement, UZA Access can top up the gap — recorded, visible to the bank, and recovered later.",
  },
  {
    n: "05",
    title: "Get allocated a vehicle",
    body: "When a container leaves China, its vehicles are listed. Bank or UZA staff link an approved driver to a specific car; the driver is notified with full details.",
  },
  {
    n: "06",
    title: "Track it to your door",
    body: "Sea freight follows the container number; inland from Mombasa is updated by our team. Driver, bank and UZA see the same timeline.",
  },
] as const;

export const BUY_OPTIONS = [
  {
    tag: "Cash",
    option: "cash" as PayOption,
    discount: "3%",
    discountLabel: "discount",
    title: "Pay in full, drive cheaper",
    body: "Full payment before the container sails earns a 3% discount off vehicle cost, applied at invoice.",
    points: ["Full payment before sailing", "Discount applied at invoice", "Fastest path to ownership"],
    highlight: true,
  },
  {
    tag: "Split",
    option: "split" as PayOption,
    discount: "1.5%",
    discountLabel: "discount",
    title: "30% now, 70% on delivery",
    body: "Lock your unit with 30%, settle the balance when the vehicle is handed over. Discount applies to the full price.",
    points: ["30% to reserve your unit", "70% due on delivery", "Discount on full price"],
    highlight: false,
  },
  {
    tag: "Financed",
    option: "financed" as PayOption,
    discount: "500K",
    discountLabel: "min. contribution",
    title: "Bank-financed from 500,000 RWF",
    body: "The minimum driver contribution. The bank lends the rest; UZA Access can bridge the gap to the required deposit.",
    points: ["From 500,000 RWF deposit", "Bank finances the balance", "UZA Access top-up available"],
    highlight: false,
  },
] as const;

export const SHARED_RECORD = [
  "UZA ID",
  "Documents",
  "Deposit & Access",
  "Allocation",
  "Shipment",
] as const;

export const PARTNER_PORTALS = [
  {
    title: "Driver",
    lens: "What I owe and what comes next",
    points: ["Document checklist", "Daily payment view", "Allocation + shipment inbox"],
  },
  {
    title: "Bank",
    lens: "Risk, equity, and cohort readiness",
    points: ["Cohort folders", "UZA Access-supported flag", "Equity and collateral status"],
  },
  {
    title: "UZA operations",
    lens: "Fleet flow from container to door",
    points: ["Container manifests", "Driver-to-vehicle linking", "Weekly tracking updates"],
  },
] as const;
