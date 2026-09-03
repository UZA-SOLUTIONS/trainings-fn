import { FiArrowRight } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { BuyOptionsGrid } from "@/components/marketing/BuyOptionsGrid";
import {
  FinancingCalculator,
  type PayOption,
} from "@/components/financing/FinancingCalculator";

type FinancingSectionProps = {
  option: PayOption;
  onOptionChange: (option: PayOption) => void;
};

export function FinancingSection({ option, onOptionChange }: FinancingSectionProps) {
  function openCalculator(next: PayOption) {
    onOptionChange(next);
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="financing" className="scroll-mt-20 border-y border-border/50 bg-muted/30">
      <div className="section-y">
        <div className="container-page">
          <div id="offers" className="flex scroll-mt-20 flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <h2 className="text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                Three ways in. Every one ends in an EV.
              </h2>
            </div>
            <Button asChild variant="outline" className="shadow-none">
              <a href="#calculator" className="inline-flex items-center gap-2">
                Open calculator
                <FiArrowRight aria-hidden />
              </a>
            </Button>
          </div>
          <div className="mt-8 sm:mt-12">
            <BuyOptionsGrid onSelect={openCalculator} />
          </div>
        </div>
      </div>

      <div id="calculator" className="scroll-mt-20 pb-10 pt-2 sm:pb-14 sm:pt-4 md:pb-16">
        <div className="container-page">
          <div className="max-w-3xl">
            <h2 className="text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
              Model Cash, Split, or Financed.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Toggle one path at a time. Figures are estimates to help you plan — final terms come
              from your partner bank.
            </p>
          </div>
        </div>
        <div className="mt-7 sm:mt-10">
          <FinancingCalculator option={option} onOptionChange={onOptionChange} />
        </div>
      </div>
    </section>
  );
}
