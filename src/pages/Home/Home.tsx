import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  FinancingCalculator,
  type PayOption,
} from "@/components/financing/FinancingCalculator";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    src: "/bg.jpg",
    alt: "Electric taxi on a Kigali street at golden hour",
    title: "Own the EV you drive.",
    body: "UZA trains taxi drivers, helps you prepare bank documents and a deposit, then finances and delivers an electric vehicle — all tracked under one UZA ID from application to your door.",
    cta: "See what you'd pay",
    ctaHref: "#calculator",
  },
  {
    src: "/1.jpg",
    alt: "UZA Mobility electric vehicle",
    title: "One ID. Every step.",
    body: "From cohort training and document upload to bank review, vehicle allocation, and shipment — driver, bank, and UZA follow the same record, so nothing gets lost between offices.",
    cta: "Track your ID",
    ctaHref: "/track",
  },
];

const HERO_INTERVAL_MS = 5500;

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
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (HERO_SLIDES.length < 2) return;
    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, HERO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  function openCalculator(option: PayOption) {
    setCalcOption(option);
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goHero(delta: number) {
    setHeroIndex((i) => (i + delta + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  return (
    <main className="overflow-x-hidden">
      <section className="relative flex min-h-[80vh] flex-col overflow-hidden">
        {HERO_SLIDES.map((slide, i) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            width={1600}
            height={1104}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-[72%_center] transition-opacity duration-1000 ease-in-out sm:object-center",
              i === heroIndex ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={i !== heroIndex}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.14_0.035_158_/0.55)_0%,oklch(0.14_0.035_158_/0.78)_45%,oklch(0.14_0.035_158_/0.94)_100%)] md:bg-gradient-to-r md:from-[oklch(0.16_0.04_158)]/94 md:via-[oklch(0.18_0.04_158)]/82 md:to-[oklch(0.2_0.03_158)]/50" />

        {HERO_SLIDES.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => goHero(-1)}
              className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 sm:left-4 sm:h-12 sm:w-12 md:left-6"
            >
              <FiChevronLeft className="size-8 sm:size-9" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => goHero(1)}
              className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 sm:right-4 sm:h-12 sm:w-12 md:right-6"
            >
              <FiChevronRight className="size-8 sm:size-9" strokeWidth={1.5} aria-hidden />
            </button>
          </>
        )}

        <div className="relative container-page flex min-h-[80vh] flex-1 flex-col justify-center py-16 text-ink-foreground sm:py-20 md:py-24">
          <div className="grid min-w-0 max-w-3xl">
            {HERO_SLIDES.map((slide, i) => {
              const active = i === heroIndex;
              return (
                <div
                  key={slide.src}
                  className={cn(
                    "col-start-1 row-start-1 transition-opacity duration-700 ease-in-out",
                    active ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none",
                  )}
                  aria-hidden={!active}
                >
                  <h1 className="font-display text-[2.25rem] font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4rem]">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-foreground/80 sm:mt-6 sm:text-lg md:text-xl md:leading-relaxed">
                    {slide.body}
                  </p>
                  <div className="mt-10 flex flex-col gap-2 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center">
                    <Button
                      size="default"
                      asChild
                      className="h-10 bg-volt text-volt-foreground shadow-none hover:bg-volt/90 sm:h-11"
                    >
                      {slide.ctaHref.startsWith("#") ? (
                        <a href={slide.ctaHref}>{slide.cta}</a>
                      ) : (
                        <Link to={slide.ctaHref}>{slide.cta}</Link>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {HERO_SLIDES.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 md:bottom-10"
              role="tablist"
              aria-label="Hero images"
            >
              {HERO_SLIDES.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  role="tab"
                  aria-selected={i === heroIndex}
                  aria-label={`Show image ${i + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === heroIndex
                      ? "w-8 bg-volt"
                      : "w-1.5 bg-ink-foreground/40 hover:bg-ink-foreground/70",
                  )}
                  onClick={() => setHeroIndex(i)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="programme" className="container-page section-y">
        <div className="max-w-3xl">
          <p className="text-eyebrow text-muted-foreground">The path to ownership</p>
          <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
            Six steps, one ID, nothing lost between offices.
          </h2>
        </div>

        <ol className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative">
              <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 border-b-0 bg-background p-5 transition-colors active:bg-muted/30 sm:p-6 hover:border-primary/35 hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary sm:h-10 sm:w-10">
                    {s.n}
                  </span>
                  <span className="text-eyebrow text-muted-foreground">
                    Step {i + 1} of {STEPS.length}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold leading-snug tracking-tight sm:mt-5 sm:text-lg">
                  {s.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground sm:mt-3">
                  {s.body}
                </p>
                {s.n === "02" && (
                  <Link
                    to="/training"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    See cohorts & modules
                    <FiArrowRight aria-hidden />
                  </Link>
                )}
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-volt"
                  aria-hidden
                />
              </article>
            </li>
          ))}
        </ol>
      </section>

      <section id="calculator" className="border-y border-border/50 bg-muted/30 section-y">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-muted-foreground">Financing calculator</p>
            <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
              Know the daily number before you sign anything.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
              Toggle Cash, Split, or Financed to see one path at a time.
            </p>
          </div>
          <div className="mt-7 sm:mt-10">
            <FinancingCalculator option={calcOption} onOptionChange={setCalcOption} />
          </div>
        </div>
      </section>

      <section
        id="partners"
        className="relative overflow-hidden border-t border-border/50 text-ink-foreground section-y"
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
            <h2 className="mt-1.5 text-[1.4rem] font-bold leading-tight tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
              Same data, three points of view.
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-snug text-ink-foreground/70 sm:mt-4 sm:text-base sm:leading-relaxed">
              Each partner financial institution defines its own document checklist, deposit rule
              and collateral policy. Add an institution without changing the platform.
            </p>
          </div>

          <div className="partners-shared mt-5 border border-ink-foreground/12 bg-ink-foreground/[0.04] px-3 py-3 sm:mt-12 sm:px-5 sm:py-5 md:px-8 md:py-6">
            <div className="flex flex-col gap-2.5 sm:gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="shrink-0">
                <p className="text-eyebrow text-volt">Shared record</p>
                <p className="mt-0.5 text-xs text-ink-foreground/55 sm:mt-1 sm:text-sm">
                  One source of truth for every partner
                </p>
              </div>
              <ul className="flex flex-wrap gap-1.5 sm:items-center sm:gap-x-1 sm:gap-y-2 md:justify-end">
                {SHARED_RECORD.map((item) => (
                  <li key={item}>
                    <span className="inline-flex rounded-full border border-ink-foreground/15 px-2 py-0.5 font-display text-[11px] font-medium tracking-wide text-ink-foreground/90 sm:border-0 sm:px-0 sm:py-0 sm:text-[13px]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
            {PORTALS.map((p, i) => (
              <article
                key={p.title}
                className="partners-lens group relative overflow-hidden rounded-2xl border border-white/80 border-b-0 bg-white px-5 py-6 text-foreground sm:px-6 sm:py-8"
                style={{ animationDelay: `${120 + i * 90}ms` }}
              >
                <div className="flex items-baseline justify-between gap-3 sm:gap-4">
                  <span className="font-display text-[1.75rem] font-bold leading-none tracking-tight text-volt transition-opacity duration-300 group-hover:opacity-90 sm:text-5xl md:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-eyebrow text-muted-foreground">Viewpoint</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground sm:mt-6 sm:text-2xl">
                  {p.title}
                </h3>
                <p className="mt-1 text-[13px] leading-snug text-muted-foreground sm:mt-2 sm:text-sm sm:leading-relaxed">
                  {p.lens}
                </p>
                <ul className="mt-3.5 space-y-2 sm:mt-8 sm:space-y-4">
                  {p.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start gap-2.5 text-[13px] text-foreground/85 sm:gap-3 sm:text-sm"
                    >
                      <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 bg-volt" aria-hidden />
                      <span className="leading-snug sm:leading-relaxed">{pt}</span>
                    </li>
                  ))}
                </ul>
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-volt"
                  aria-hidden
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="offers" className="container-page section-y">
        <div className="max-w-2xl">
          <p className="text-eyebrow text-muted-foreground">Buy options</p>
          <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
            Three ways in. Every one of them ends in an EV.
          </h2>
        </div>

        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-12 sm:grid sm:snap-none sm:gap-5 sm:overflow-visible sm:pb-0 lg:grid-cols-3 lg:items-stretch [&::-webkit-scrollbar]:hidden">
          {OFFERS.map((o, i) => (
            <article
              key={o.tag}
              className={`relative flex w-[85vw] max-w-[21rem] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border p-5 sm:w-auto sm:max-w-none sm:shrink sm:p-7 md:p-8 ${
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
