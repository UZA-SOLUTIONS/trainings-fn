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
  return (
    <section id="financing" className="scroll-mt-20 border-t border-border/50 bg-muted/30">
      <div className="section-y">
        <div className="container-page">
          <div id="offers" className="flex scroll-mt-20 flex-wrap items-end justify-end gap-4">
            <Button asChild variant="outline" className="shadow-none">
              <a href="#calculator" className="inline-flex items-center gap-2">
                Open calculator
                <FiArrowRight aria-hidden />
              </a>
            </Button>
          </div>
        </div>
        <div className="mt-8 pl-4 sm:mt-12 sm:pl-6 md:pl-8 lg:pl-10">
          <BuyOptionsGrid />
        </div>
      </div>

      <div id="calculator" className="scroll-mt-20 pb-10 pt-2 sm:pb-14 sm:pt-4 md:pb-16">
        <div className="px-4 sm:px-6 md:px-8 lg:px-10">
          <FinancingCalculator option={option} onOptionChange={onOptionChange} />
        </div>
      </div>
    </section>
  );
}
