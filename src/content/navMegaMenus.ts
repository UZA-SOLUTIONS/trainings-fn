export type NavMegaItem = {
  id: string;
  label: string;
  title: string;
  description: string;
  cta: string;
  to: string;
  image: string;
  meta?: string;
};

export type NavMegaMenuConfig = {
  id: "programme" | "training" | "financing";
  label: string;
  eyebrow: string;
  path: string;
  items: NavMegaItem[];
};

export const PROGRAMME_MEGA: NavMegaMenuConfig = {
  id: "programme",
  label: "Programme",
  eyebrow: "Programme",
  path: "/",
  items: [
    {
      id: "how-it-works",
      label: "How it works",
      title: "How it works",
      description:
        "Six clear steps from your UZA ID through training, documents, financing, vehicle allocation, and delivery tracking. One record shared by driver, bank, and UZA.",
      cta: "View the steps",
      to: "/#path",
      image: "/1.jpg",
    },
    {
      id: "training",
      label: "Training",
      title: "Training cohorts",
      description:
        "Browse open cohorts and curriculum modules. Complete training to move into a verified folder partner banks can review directly.",
      cta: "See training",
      to: "/apply",
      image: "/bg.jpg",
    },
    {
      id: "financing",
      label: "Financing",
      title: "Financing paths",
      description:
        "Choose cash, split payment, or bank-financed options. Model your contribution and see how UZA Access can bridge deposit gaps.",
      cta: "Explore financing",
      to: "/#financing",
      image: "/ev.avif",
    },
    {
      id: "requirements",
      label: "Requirements",
      title: "Requirements",
      description:
        "Know what documents and checks each path needs before you apply, so your file is complete the first time.",
      cta: "View requirements",
      to: "/requirements",
      image: "/hero.avif",
    },
    {
      id: "track",
      label: "Track ID",
      title: "Track your application",
      description:
        "Enter your UZA ID or bank ID to follow training progress, documents, financing, allocation, and shipment in one place.",
      cta: "Track now",
      to: "/track",
      image: "/1.jpg",
    },
    {
      id: "apply",
      label: "Apply",
      title: "Apply for training",
      description:
        "Start your application, receive a permanent UZA ID, and join an open cohort when you are ready.",
      cta: "Start application",
      to: "/apply",
      image: "/bg.jpg",
    },
    {
      id: "partners",
      label: "Partners",
      title: "Same data, three points of view",
      description:
        "One shared UZA record feeds the driver, the bank, and operations without rebuilding the platform.",
      cta: "See viewpoints",
      to: "/#partners",
      image: "/ev.avif",
    },
  ],
};

export const TRAINING_MEGA: NavMegaMenuConfig = {
  id: "training",
  label: "Training",
  eyebrow: "Training",
  path: "/apply",
  items: [],
};

export const FINANCING_MEGA: NavMegaMenuConfig = {
  id: "financing",
  label: "Financing",
  eyebrow: "Financing",
  path: "/",
  items: [
    {
      id: "overview",
      label: "Overview",
      title: "Financing overview",
      description:
        "Know the daily number before you sign. Compare Cash, Split, and bank-financed paths, then plan your deposit including UZA Access.",
      cta: "Explore financing",
      to: "/#financing",
      image: "/ev.avif",
    },
    {
      id: "offers",
      label: "Buy options",
      title: "Three ways in",
      description:
        "Cash, Split, or Financed. Every path ends in an EV. Pick one, then compare the numbers in the calculator.",
      cta: "See buy options",
      to: "/#offers",
      image: "/1.jpg",
    },
    {
      id: "cash",
      label: "Cash",
      title: "Pay in full",
      description:
        "Full payment before the container sails earns a 3% discount off vehicle cost, applied at invoice.",
      cta: "Model cash",
      to: "/?option=cash#calculator",
      image: "/bg.jpg",
    },
    {
      id: "split",
      label: "Split",
      title: "30% now, 70% on delivery",
      description:
        "Lock your unit with 30%, settle the balance when the vehicle is handed over. Discount applies to the full price.",
      cta: "Model split",
      to: "/?option=split#calculator",
      image: "/hero.avif",
    },
    {
      id: "financed",
      label: "Bank financed",
      title: "Bank-financed from 500,000 RWF",
      description:
        "The minimum driver contribution. The bank lends the rest; UZA Access can bridge the gap to the required deposit.",
      cta: "Model financed",
      to: "/?option=financed#calculator",
      image: "/ev.avif",
    },
    {
      id: "calculator",
      label: "Calculator",
      title: "Financing calculator",
      description:
        "Toggle Cash, Split, or Financed and estimate what you would pay. Final terms come from your partner bank.",
      cta: "Open calculator",
      to: "/#calculator",
      image: "/bg.jpg",
    },
  ],
};

export const NAV_MEGA_MENUS = [PROGRAMME_MEGA, TRAINING_MEGA, FINANCING_MEGA] as const;

export type NavMegaId = (typeof NAV_MEGA_MENUS)[number]["id"];

export function getNavMega(id: NavMegaId) {
  return NAV_MEGA_MENUS.find((m) => m.id === id)!;
}
