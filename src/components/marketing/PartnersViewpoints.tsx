import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PARTNER_PORTALS } from "@/content/marketing";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 9000;
const FADE_MS = 1200;

/** Cinematic viewpoints: calm crossfade between slides. */
export function PartnersViewpoints() {
  const [index, setIndex] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const count = PARTNER_PORTALS.length;
  const active = PARTNER_PORTALS[index]!;

  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(() => {
      go(1);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- interval resets on index change
  }, [count, index]);

  function go(delta: number) {
    setTextVisible(false);
    window.setTimeout(() => {
      setIndex((i) => (i + delta + count) % count);
      requestAnimationFrame(() => setTextVisible(true));
    }, FADE_MS / 2);
  }

  return (
    <div className="bg-background">
      <div className="px-6 pb-6 pt-12 text-center sm:px-10 sm:pb-8 sm:pt-14 md:px-16 md:pt-16">
        <div
          className={cn(
            "transition-all ease-[cubic-bezier(0.22,1,0.36,1)]",
            textVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-1 opacity-0",
          )}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <h3 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {active.title}
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-500 sm:mt-4 sm:text-base md:text-lg">
            {active.lens}
          </p>
          <Link
            to={active.cta.href}
            className="mt-6 inline-flex h-10 min-w-[9rem] items-center justify-center rounded-md border border-neutral-300 bg-white px-5 text-sm font-medium text-neutral-900 transition-colors hover:bg-white/90 sm:mt-7 sm:h-11"
          >
            {active.cta.label}
          </Link>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        {PARTNER_PORTALS.map((p, i) => (
          <img
            key={p.title}
            src={p.image}
            alt={p.imageAlt}
            className={cn(
              "h-[58vh] w-full object-cover object-center transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-[62vh] md:h-[68vh] lg:h-[72vh]",
              i === 0 ? "relative" : "absolute inset-0",
              i === index ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDuration: `${FADE_MS}ms` }}
            aria-hidden={i !== index}
          />
        ))}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-background from-0% via-background/90 via-35% to-transparent to-100% sm:h-40 md:h-48"
          aria-hidden
        />

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous viewpoint"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-white/25 text-white backdrop-blur-[2px] transition-colors hover:bg-white/40 sm:left-5 sm:h-11 sm:w-11"
            >
              <FiChevronLeft className="size-6" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next viewpoint"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-white/25 text-white backdrop-blur-[2px] transition-colors hover:bg-white/40 sm:right-5 sm:h-11 sm:w-11"
            >
              <FiChevronRight className="size-6" strokeWidth={1.75} aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
