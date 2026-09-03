import { FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { BUY_OPTIONS } from "@/content/marketing";
import type { PayOption } from "@/components/financing/FinancingCalculator";
import { cn } from "@/lib/utils";

export function BuyOptionsGrid({
  onSelect,
}: {
  onSelect?: (option: PayOption) => void;
}) {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:snap-none sm:gap-5 sm:overflow-visible sm:pb-0 lg:grid-cols-3 lg:items-stretch [&::-webkit-scrollbar]:hidden">
      {BUY_OPTIONS.map((o) => (
        <article
          key={o.tag}
          className={cn(
            "relative flex w-[85vw] max-w-[21rem] shrink-0 snap-center flex-col overflow-hidden border p-5 sm:w-auto sm:max-w-none sm:shrink sm:p-7 md:p-8",
            o.highlight
              ? "border-primary bg-primary text-primary-foreground lg:-translate-y-2"
              : "border-border/70 bg-background",
          )}
        >
          <div>
            <p
              className={cn(
                "font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl",
                o.highlight ? "text-volt" : "text-foreground",
              )}
            >
              {o.discount}
            </p>
            <p
              className={cn(
                "mt-1 text-sm font-medium uppercase tracking-[0.12em]",
                o.highlight ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {o.discountLabel}
            </p>
          </div>

          <h3 className="mt-6 text-xl font-bold leading-snug tracking-tight sm:mt-8 sm:text-2xl">
            {o.title}
          </h3>
          <p
            className={cn(
              "mt-3 text-sm leading-relaxed sm:text-base",
              o.highlight ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {o.body}
          </p>

          <ul className="mt-5 space-y-2.5 sm:mt-6">
            {o.points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm leading-snug">
                <FiCheck
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    o.highlight ? "text-volt" : "text-primary",
                  )}
                  aria-hidden
                />
                <span className={o.highlight ? "text-primary-foreground/90" : "text-foreground/90"}>
                  {point}
                </span>
              </li>
            ))}
          </ul>

          {onSelect && (
            <div className="mt-auto pt-6 sm:pt-8">
              <Button
                type="button"
                onClick={() => onSelect(o.option)}
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
          )}
        </article>
      ))}
    </div>
  );
}
