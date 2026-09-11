import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BUY_OPTIONS } from "@/content/marketing";
import { cn } from "@/lib/utils";

/** Homepage buy paths — larger Tesla-style teasers; third card scrolls in from the right. */
export function BuyOptionsGrid() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);

  const updateActive = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const mid = root.scrollLeft + root.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    updateActive();
    root.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      root.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [updateActive]);

  function scrollToCard(i: number) {
    const el = cardRefs.current[i];
    const root = scrollerRef.current;
    if (!el || !root) return;
    root.scrollTo({ left: Math.max(0, el.offsetLeft - 16), behavior: "smooth" });
    setActive(i);
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        className="snap-x snap-mandatory overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max gap-5 sm:gap-6 md:gap-7">
          {BUY_OPTIONS.map((o, i) => (
            <Link
              key={o.slug}
              to={`/buy/${o.slug}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="partners-lens group grid min-h-[18rem] w-[min(88vw,24rem)] shrink-0 snap-start overflow-hidden rounded-2xl bg-primary text-primary-foreground transition-opacity hover:opacity-95 sm:min-h-[22rem] sm:w-[calc((100vw-5rem-1.5rem)/2)] sm:grid-cols-[1.05fr_0.95fr] sm:rounded-3xl md:min-h-[24rem] md:w-[calc((100vw-6.5rem-1.75rem)/2)] lg:min-h-[26rem] lg:w-[calc((100vw-8rem-2rem)/2)]"
            >
              <div className="flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-9 md:px-10">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-volt sm:text-sm">
                  {o.discount} {o.discountLabel}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl md:text-[2rem]">
                  {o.title}
                </h3>
                <p className="mt-3 text-sm leading-snug text-primary-foreground/80 line-clamp-3 sm:text-[15px]">
                  {o.body}
                </p>
                <span className="mt-6 inline-flex h-10 w-fit items-center justify-center rounded-md bg-volt px-5 text-sm font-medium text-volt-foreground transition-colors group-hover:bg-volt/90 sm:h-11">
                  Learn more
                </span>
              </div>
              <div className="relative min-h-[12rem] sm:min-h-0">
                <img
                  src={o.image}
                  alt={o.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div
        className="mt-6 flex items-center justify-center gap-3.5 sm:mt-8 sm:gap-4"
        role="tablist"
        aria-label="Buy options"
      >
        {BUY_OPTIONS.map((o, i) => (
          <button
            key={o.slug}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show ${o.title}`}
            className={cn(
              "size-3.5 rounded-full border-2 transition-all duration-300 sm:size-4",
              i === active
                ? "border-foreground bg-foreground"
                : "border-neutral-400 bg-transparent hover:border-foreground hover:bg-foreground/15",
            )}
            onClick={() => scrollToCard(i)}
          />
        ))}
      </div>
    </div>
  );
}
