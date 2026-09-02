import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { StepsJourney } from "@/components/home/StepsJourney";
import { PartnersSection } from "@/components/marketing/PartnersSection";
import { BuyOptionsGrid } from "@/components/marketing/BuyOptionsGrid";
import { PROGRAMME_STEPS } from "@/content/marketing";
import type { PayOption } from "@/components/financing/FinancingCalculator";
import { cn } from "@/lib/utils";

const HERO_SLIDES = [
  {
    src: "/bg.jpg",
    alt: "Electric taxi on a Kigali street at golden hour",
    title: "Own the EV you drive.",
    body: "UZA trains taxi drivers, helps you prepare bank documents and a deposit, then finances and delivers an electric vehicle. Everything is tracked under one UZA ID from application to your door.",
    cta: "See what you'd pay",
    ctaHref: "/financing",
  },
  {
    src: "/1.jpg",
    alt: "UZA Mobility electric vehicle",
    title: "One ID. Every step.",
    body: "From cohort training and document upload to bank review, vehicle allocation, and shipment, driver, bank, and UZA follow the same record so nothing gets lost between offices.",
    cta: "Track your ID",
    ctaHref: "/track",
  },
];

const HERO_INTERVAL_MS = 5500;

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (HERO_SLIDES.length < 2) return;
    const id = window.setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, HERO_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  function goHero(delta: number) {
    setHeroIndex((i) => (i + delta + HERO_SLIDES.length) % HERO_SLIDES.length);
  }

  function goFinancing(option?: PayOption) {
    const q = option ? `?option=${option}` : "";
    window.location.assign(`/financing${q}#calculator`);
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
                    active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
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
                      <Link to={slide.ctaHref}>{slide.cta}</Link>
                    </Button>
                    <Button
                      size="default"
                      asChild
                      variant="outline"
                      className="h-10 border-white/35 bg-transparent text-ink-foreground shadow-none hover:bg-white/10 sm:h-11"
                    >
                      <Link to="/programme">How it works</Link>
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

      <section className="container-page section-y">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-muted-foreground">The path to ownership</p>
            <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
              Six steps, one ID, nothing lost between offices.
            </h2>
          </div>
          <Button asChild variant="outline" className="shadow-none">
            <Link to="/programme" className="inline-flex items-center gap-2">
              Full programme
              <FiArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <StepsJourney steps={[...PROGRAMME_STEPS]} />
      </section>

      <section className="border-y border-border/50 bg-muted/30 section-y">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-eyebrow text-muted-foreground">Financing</p>
              <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
                Three ways in. Every one ends in an EV.
              </h2>
            </div>
            <Button asChild variant="outline" className="shadow-none">
              <Link to="/financing" className="inline-flex items-center gap-2">
                Open calculator
                <FiArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
          <div className="mt-8 sm:mt-12">
            <BuyOptionsGrid onSelect={(option) => goFinancing(option)} />
          </div>
        </div>
      </section>

      <PartnersSection />
    </main>
  );
}
