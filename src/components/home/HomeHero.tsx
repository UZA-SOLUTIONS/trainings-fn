import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HOME_HERO_SLIDES } from "@/content/marketing";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 6500;

export function HomeHero() {
  const [index, setIndex] = useState(0);
  const count = HOME_HERO_SLIDES.length;

  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count]);

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  const slide = HOME_HERO_SLIDES[index]!;

  return (
    <section className="relative flex min-h-[90vh] flex-col overflow-hidden bg-black">
      {HOME_HERO_SLIDES.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          width={1600}
          height={1104}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== index}
        />
      ))}

      {/* Soft top + bottom scrims for nav/text — keep the photo dominant */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.08)_28%,rgba(0,0,0,0.12)_62%,rgba(0,0,0,0.45)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[oklch(0.28_0.06_158_/0.18)]"
        aria-hidden
      />

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-white/25 text-white backdrop-blur-[2px] transition-colors hover:bg-white/40 sm:left-5 sm:h-11 sm:w-11"
          >
            <FiChevronLeft className="size-6" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-white/25 text-white backdrop-blur-[2px] transition-colors hover:bg-white/40 sm:right-5 sm:h-11 sm:w-11"
          >
            <FiChevronRight className="size-6" strokeWidth={1.75} aria-hidden />
          </button>
        </>
      )}

      <div className="relative z-10 flex min-h-[90vh] flex-1 flex-col items-center justify-center px-4 pb-20 pt-20 text-center text-white">
        <div
          key={slide.src}
          className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2 duration-700"
        >
          <p className="text-center font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            {slide.title}
          </p>
          <p className="mx-auto mt-3 max-w-md text-center text-sm font-medium tracking-wide text-white/95 underline decoration-white/75 underline-offset-[5px] sm:mt-3.5 sm:text-base md:text-lg">
            {slide.subtitle}
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row sm:gap-4">
            <Link
              to={slide.primary.href}
              className="inline-flex h-10 min-w-[14rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:h-11 sm:min-w-[15.5rem] sm:text-[15px]"
            >
              {slide.primary.label}
            </Link>
            <Link
              to={slide.secondary.href}
              className="inline-flex h-10 min-w-[14rem] items-center justify-center rounded-md bg-volt px-6 text-sm font-medium text-volt-foreground transition-colors hover:bg-volt/90 sm:h-11 sm:min-w-[15.5rem] sm:text-[15px]"
            >
              {slide.secondary.label}
            </Link>
          </div>
        </div>

        {count > 1 && (
          <div
            className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3.5 sm:bottom-10 sm:gap-4"
            role="tablist"
            aria-label="Hero slides"
          >
            {HOME_HERO_SLIDES.map((s, i) => (
              <button
                key={s.src}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show slide ${i + 1}`}
                className={cn(
                  "size-3.5 rounded-full border-2 transition-all duration-300 sm:size-4",
                  i === index
                    ? "border-white bg-white"
                    : "border-white/70 bg-transparent hover:border-white hover:bg-white/25",
                )}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
