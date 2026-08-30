import { useState } from "react";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  FinancingCalculator,
  type PayOption,
} from "@/components/financing/FinancingCalculator";
import heroImage from "@/assets/images/hero-ev-taxi.jpg";

const STEPS = [
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
];

const OFFERS = [
  {
    tag: "Cash",
    option: "cash" as const,
    discount: "3%",
    discountLabel: "discount",
    title: "Pay in full, drive cheaper",
    body: "Full payment before the container sails earns a 3% discount off vehicle cost, applied at invoice.",
    points: ["Full payment before sailing", "Discount applied at invoice", "Fastest path to ownership"],
    highlight: true,
  },
  {
    tag: "Split",
    option: "split" as const,
    discount: "1.5%",
    discountLabel: "discount",
    title: "30% now, 70% on delivery",
    body: "Lock your unit with 30%, settle the balance when the vehicle is handed over. Discount applies to the full price.",
    points: ["30% to reserve your unit", "70% due on delivery", "Discount on full price"],
    highlight: false,
  },
  {
    tag: "Financed",
    option: "financed" as const,
    discount: "500K",
    discountLabel: "min. contribution",
    title: "Bank-financed from 500,000 RWF",
    body: "The minimum driver contribution. The bank lends the rest; UZA Access can bridge the gap to the required deposit.",
    points: ["From 500,000 RWF deposit", "Bank finances the balance", "UZA Access top-up available"],
    highlight: false,
  },
];

const SHARED_RECORD = [
  "UZA ID",
  "Documents",
  "Deposit & Access",
  "Allocation",
  "Shipment",
];

const PORTALS = [
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
];

export default function Home() {
  const [calcOption, setCalcOption] = useState<PayOption>("financed");

  function openCalculator(option: PayOption) {
    setCalcOption(option);
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      <section className="relative min-h-[min(100svh,42rem)] overflow-hidden md:min-h-[68vh]">
        <img
          src={heroImage}
          alt="Electric taxi charging on a Kigali street at golden hour"
          width={1600}
          height={1104}
          className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.04_158)]/88 via-[oklch(0.16_0.04_158)]/72 to-[oklch(0.16_0.04_158)]/55 md:bg-gradient-to-r md:from-[oklch(0.16_0.04_158)]/92 md:via-[oklch(0.18_0.04_158)]/78 md:to-[oklch(0.2_0.03_158)]/45" />
        <div className="relative container-page flex min-h-[min(100svh,42rem)] flex-col justify-end pb-12 pt-24 text-ink-foreground sm:justify-center sm:py-20 md:min-h-[68vh] md:py-24">
          <h1 className="max-w-[18ch] font-display text-[1.85rem] font-bold leading-[1.12] tracking-tight sm:max-w-lg sm:text-4xl md:max-w-xl md:text-5xl lg:max-w-2xl lg:text-6xl">
            Rwanda&apos;s taxi drivers should own the electric car they drive.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-foreground/80 sm:mt-6 sm:text-base md:max-w-lg md:text-lg lg:max-w-xl">
            One platform from application to ownership: a driver ID, guided bank paperwork,
            transparent daily repayments, vehicle allocation the moment a container ships, and
            tracking all the way to Kigali.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              size="lg"
              asChild
              className="w-full bg-volt text-volt-foreground shadow-none hover:bg-volt/90 sm:w-auto"
            >
              <a href="#calculator">See what you&apos;d pay per day</a>
            </Button>
            <Button
              size="lg"
              asChild
              className="w-full border border-white/35 bg-transparent text-ink-foreground shadow-none hover:bg-white/10 sm:w-auto"
            >
              <a href="#programme" className="inline-flex items-center justify-center gap-2">
                How the programme works
                <FiArrowRight aria-hidden />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section id="programme" className="container-page py-14 sm:py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="text-eyebrow text-muted-foreground">The path to ownership</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Six steps, one ID, nothing lost between offices.
          </h2>
        </div>

        <ol className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative">
              <article className="flex h-full flex-col rounded-2xl border border-border/70 bg-background p-5 sm:p-6 transition-colors hover:border-primary/35 hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                    {s.n}
                  </span>
                  <span className="text-eyebrow text-muted-foreground">
                    Step {i + 1} of {STEPS.length}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold leading-snug tracking-tight">
                  {s.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section id="calculator" className="border-y border-border/50 bg-muted/30 py-14 sm:py-20 md:py-28">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-muted-foreground">Financing calculator</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Know the daily number before you sign anything.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed sm:mt-4 sm:text-base">
              Toggle Cash, Split, or Financed to see one path at a time.
            </p>
          </div>
          <div className="mt-8 sm:mt-10">
            <FinancingCalculator option={calcOption} onOptionChange={setCalcOption} />
          </div>
        </div>
      </section>

      <section
        id="partners"
        className="relative overflow-hidden border-t border-border/50 py-14 text-ink-foreground sm:py-20 md:py-28"
      >
        <img
          src="/hero.avif"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[oklch(0.16_0.04_158)]/86 md:bg-[oklch(0.16_0.04_158)]/82" />
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 55% at 10% 0%, oklch(0.35 0.08 158 / 0.35), transparent 55%),
              radial-gradient(ellipse 60% 45% at 95% 90%, oklch(0.7 0.18 128 / 0.1), transparent 50%)
            `,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.97 0.015 130 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.97 0.015 130 / 0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "linear-gradient(180deg, black, transparent 90%)",
          }}
        />

        <div className="relative container-page">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-ink-foreground/50">Built for partnerships</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Same data, three points of view.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-foreground/70 sm:mt-4 sm:text-base">
              Each partner financial institution defines its own document checklist, deposit rule
              and collateral policy. Add an institution without changing the platform.
            </p>
          </div>

          <div className="partners-shared mt-8 border border-ink-foreground/12 bg-ink-foreground/[0.04] px-4 py-4 sm:mt-12 sm:px-5 sm:py-5 md:px-8 md:py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="shrink-0">
                <p className="text-eyebrow text-volt">Shared record</p>
                <p className="mt-1 text-sm text-ink-foreground/55">One source of truth for every partner</p>
              </div>
              <ul className="flex flex-wrap gap-2 sm:items-center sm:gap-x-1 sm:gap-y-2 md:justify-end">
                {SHARED_RECORD.map((item) => (
                  <li key={item}>
                    <span className="inline-flex rounded-full border border-ink-foreground/15 px-2.5 py-1 font-display text-[12px] font-medium tracking-wide text-ink-foreground/90 sm:border-0 sm:px-0 sm:py-0 sm:text-[13px]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-2 grid gap-0 md:mt-0 md:grid-cols-3">
            {PORTALS.map((p, i) => (
              <article
                key={p.title}
                className="partners-lens group relative border-t border-ink-foreground/12 px-0 py-8 sm:px-1 sm:py-10 md:border-t-0 md:border-l md:px-8 md:py-12 first:md:border-l-0 first:md:pl-0"
                style={{ animationDelay: `${120 + i * 90}ms` }}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="font-display text-4xl font-bold leading-none tracking-tight text-volt/35 transition-colors duration-300 group-hover:text-volt/55 sm:text-5xl md:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-eyebrow text-ink-foreground/35">Viewpoint</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold tracking-tight sm:mt-6 sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-foreground/55">{p.lens}</p>
                <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-sm text-ink-foreground/85">
                      <span
                        className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 bg-volt"
                        aria-hidden
                      />
                      <span className="leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="offers" className="container-page py-14 sm:py-20 md:py-28">
        <div className="max-w-2xl">
          <p className="text-eyebrow text-muted-foreground">Buy options</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Three ways in. Every one of them ends in an EV.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-3 lg:items-stretch">
          {OFFERS.map((o, i) => (
            <article
              key={o.tag}
              className={`relative flex flex-col overflow-hidden rounded-2xl border p-5 sm:p-7 md:p-8 ${
                o.highlight
                  ? "border-primary bg-primary text-primary-foreground lg:-translate-y-2 lg:shadow-none"
                  : "border-border/70 bg-background"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    o.highlight
                      ? "bg-white/15 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  Option {String(i + 1).padStart(2, "0")} · {o.tag}
                </span>
              </div>

              <div className="mt-6 sm:mt-8">
                <p
                  className={`font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl ${
                    o.highlight ? "text-volt" : "text-foreground"
                  }`}
                >
                  {o.discount}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    o.highlight ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {o.discountLabel}
                </p>
              </div>

              <h3 className="mt-5 font-display text-lg font-semibold leading-snug tracking-tight sm:mt-6 sm:text-xl">
                {o.title}
              </h3>
              <p
                className={`mt-3 text-sm leading-relaxed ${
                  o.highlight ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {o.body}
              </p>

              <ul className="mt-6 space-y-3 border-t border-current/10 pt-5 sm:mt-8 sm:pt-6">
                {o.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        o.highlight
                          ? "bg-volt/20 text-volt"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <FiCheck size={12} aria-hidden />
                    </span>
                    <span
                      className={
                        o.highlight ? "text-primary-foreground/85" : "text-muted-foreground"
                      }
                    >
                      {pt}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6 sm:pt-8">
                <Button
                  type="button"
                  onClick={() => openCalculator(o.option)}
                  className={
                    o.highlight
                      ? "w-full border-0 bg-volt text-volt-foreground shadow-none hover:bg-volt/90"
                      : "w-full shadow-none"
                  }
                  variant={o.highlight ? "default" : "outline"}
                >
                  Compare with calculator
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
