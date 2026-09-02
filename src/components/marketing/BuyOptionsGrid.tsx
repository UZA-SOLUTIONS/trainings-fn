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
      {BUY_OPTIONS.map((o, i) => (
        <article
          key={o.tag}
          className={cn(
            "relative flex w-[85vw] max-w-[21rem] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-b-0 p-5 sm:w-auto sm:max-w-none sm:shrink sm:p-7 md:p-8",
            o.highlight
              ? "border-primary bg-primary text-primary-foreground lg:-translate-y-2"
              : "border-border/70 bg-background",
          )}
        >
          <span
            className={cn(
              "w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
              o.highlight
                ? "bg-white/15 text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            Option {String(i + 1).padStart(2, "0")} · {o.tag}
          </span>

          <div className="mt-6 sm:mt-8">
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
                "mt-1 text-sm",
                o.highlight ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {o.discountLabel}
            </p>
          </div>

          <h3 className="mt-5 font-display text-lg font-semibold leading-snug tracking-tight sm:mt-6 sm:text-xl">
            {o.title}
          </h3>
          <p
            className={cn(
              "mt-3 text-sm leading-relaxed",
              o.highlight ? "text-primary-foreground/80" : "text-muted-foreground",
            )}
          >
            {o.body}
          </p>

          <ul className="mt-6 space-y-3 border-t border-current/10 pt-5 sm:mt-8 sm:pt-6">
            {o.points.map((pt) => (
              <li key={pt} className="flex items-start gap-3 text-sm">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    o.highlight ? "bg-volt/20 text-volt" : "bg-primary/10 text-primary",
                  )}
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

          <span
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-1.5",
              o.highlight ? "bg-volt" : "bg-volt",
            )}
            aria-hidden
          />
        </article>
      ))}
    </div>
  );
}
