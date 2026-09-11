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

export const HOME_HERO_SLIDES = [
  {
    src: "/1.jpg",
    alt: "UZA Mobility electric vehicle on the road",
    title: "One ID. Every step.",
    subtitle: "Track your application from training to delivery",
    primary: { label: "Track your ID", href: "/track" },
    secondary: { label: "How it works", href: "/#path" },
  },
  {
    src: "/bg.jpg",
    alt: "Electric taxi on a city street",
    title: "Own the EV you drive.",
    subtitle: "Apply for training and start your path to ownership",
    primary: { label: "Apply now", href: "/apply" },
    secondary: { label: "See financing", href: "/#financing" },
  },
  {
    src: "/hero.avif",
    alt: "UZA electric fleet",
    title: "Train. Finance. Deliver.",
    subtitle: "Check requirements before you start",
    primary: { label: "View requirements", href: "/requirements" },
    secondary: { label: "Track your ID", href: "/track" },
  },
] as const;

export const PATH_STEP_IMAGES = [
  "/1.jpg",
  "/bg.jpg",
  "/ev.avif",
  "/hero.avif",
  "/1.jpg",
  "/bg.jpg",
] as const;

export const BUY_OPTIONS = [
  {
    slug: "pay-in-full",
    tag: "Cash",
    option: "cash" as PayOption,
    discount: "3%",
    discountLabel: "discount",
    title: "Pay in full, drive cheaper",
    body: "Full payment before the container sails earns a 3% discount off vehicle cost, applied at invoice.",
    points: ["Full payment before sailing", "Discount applied at invoice", "Fastest path to ownership"],
    highlight: true,
    image: "/buy-cash-ev.png",
    imageAlt: "Electric taxi on wet asphalt at dusk",
  },
  {
    slug: "split",
    tag: "Split",
    option: "split" as PayOption,
    discount: "1.5%",
    discountLabel: "discount",
    title: "30% now, 70% on delivery",
    body: "Lock your unit with 30%, settle the balance when the vehicle is handed over. Discount applies to the full price.",
    points: ["30% to reserve your unit", "70% due on delivery", "Discount on full price"],
    highlight: false,
    image: "/buy-split-ev.png",
    imageAlt: "Electric taxi ready for delivery handover",
  },
  {
    slug: "bank-financed",
    tag: "Financed",
    option: "financed" as PayOption,
    discount: "500K",
    discountLabel: "min. contribution",
    title: "Bank-financed from 500,000 RWF",
    body: "The minimum driver contribution. The bank lends the rest; UZA Access can bridge the gap to the required deposit.",
    points: ["From 500,000 RWF deposit", "Bank finances the balance", "UZA Access top-up available"],
    highlight: false,
    image: "/buy-financed-ev.png",
    imageAlt: "Modern electric taxi cabin with glowing display",
  },
] as const;

export type BuyOptionSlug = (typeof BUY_OPTIONS)[number]["slug"];

export function getBuyOptionBySlug(slug: string) {
  return BUY_OPTIONS.find((o) => o.slug === slug) ?? null;
}

export const SHARED_RECORD = [
  "UZA ID",
  "Documents",
  "Deposit & Access",
  "Allocation",
  "Shipment",
] as const;

export const PARTNER_BANKS = [
  { name: "Unguka Bank", logo: "/unguka.jfif" },
  { name: "NCBA", logo: "/NCBA.png" },
] as const;

export const PARTNER_PORTALS = [
  {
    title: "Driver",
    lens: "What I owe and what comes next",
    image: "/viewpoint-driver-ev.png",
    imageAlt: "Electric taxi ready for the driver",
    cta: { label: "Track ID", href: "/track" },
  },
  {
    title: "Bank",
    lens: "Risk, equity, and cohort readiness",
    image: "/viewpoint-bank-ev.png",
    imageAlt: "Electric vehicle for bank financing review",
    cta: { label: "Financing", href: "/#financing" },
  },
  {
    title: "UZA operations",
    lens: "Fleet flow from container to door",
    image: "/viewpoint-ops-ev.png",
    imageAlt: "Electric fleet lined up for allocation and delivery",
    cta: { label: "How it works", href: "/#path" },
  },
] as const;

export const EXPO_STORIES = [
  {
    slug: "launch",
    label: "Featured stories",
    title: "UZA Mobility goes live at the expo",
    body: "We introduced the programme on the floor, walking taxi drivers through training, financing, and the path to an EV.",
    cta: { label: "Read the story", href: "/news/launch" },
    image: "/news.jpg",
    imageAlt: "UZA Mobility booth at the mobility expo",
  },
  {
    slug: "drivers",
    label: "Featured stories",
    title: "Taxi drivers step into ownership",
    body: "Drivers signed interest, asked about deposits, and saw how a shared UZA ID follows them from training to delivery.",
    cta: { label: "See how it works", href: "/news/drivers" },
    image: "/news2.jpg",
    imageAlt: "Taxi drivers engaging at the UZA Mobility expo stand",
  },
  {
    slug: "banks",
    label: "Featured stories",
    title: "Banks on the floor with us",
    body: "Partner banks joined conversations on risk, deposits, and UZA Access so drivers could fund the car they will drive.",
    cta: { label: "Explore financing", href: "/news/banks" },
    image: "/news3.jpg",
    imageAlt: "Electric taxis and bank-funded ownership conversations at the expo",
  },
] as const;

export type ExpoStorySlug = (typeof EXPO_STORIES)[number]["slug"];

export function getExpoStoryBySlug(slug: string) {
  return EXPO_STORIES.find((s) => s.slug === slug) ?? null;
}
