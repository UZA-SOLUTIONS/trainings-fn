import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import {
  FinancingCalculator,
  type PayOption,
} from "@/components/financing/FinancingCalculator";
import { BuyOptionsGrid } from "@/components/marketing/BuyOptionsGrid";
import { Button } from "@/components/ui/button";

function isPayOption(v: string | null): v is PayOption {
  return v === "cash" || v === "split" || v === "financed";
}

export default function Financing() {
  const [params] = useSearchParams();
  const optionParam = params.get("option");
  const initial: PayOption = isPayOption(optionParam) ? optionParam : "financed";
  const [calcOption, setCalcOption] = useState<PayOption>(initial);

  useEffect(() => {
    const next = params.get("option");
    if (isPayOption(next)) setCalcOption(next);
  }, [params]);

  useEffect(() => {
    if (window.location.hash === "#calculator" || window.location.hash === "#offers") {
      const el = document.getElementById(window.location.hash.slice(1));
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  function openCalculator(option: PayOption) {
    setCalcOption(option);
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      <PageHero
        eyebrow="Financing"
        title="Know the daily number before you sign anything."
        description="Compare Cash, Split, and bank-financed paths. Estimate what you would pay, then apply with a clear deposit plan — including UZA Access if you need a top-up."
        primary={{ label: "Open calculator", href: "#calculator" }}
        secondary={{ label: "Document checklist", to: "/requirements" }}
      />

      <section id="offers" className="container-page section-y">
        <div className="max-w-2xl">
          <p className="text-eyebrow text-muted-foreground">Buy options</p>
          <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
            Three ways in. Every one of them ends in an EV.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Pick a path, then compare the numbers in the calculator below.
          </p>
        </div>
        <div className="mt-8 sm:mt-12">
          <BuyOptionsGrid onSelect={openCalculator} />
        </div>
      </section>

      <section id="calculator" className="border-y border-border/50 bg-muted/30 section-y">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="text-eyebrow text-muted-foreground">Financing calculator</p>
            <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
              Model Cash, Split, or Financed.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Toggle one path at a time. Figures are estimates to help you plan — final terms come
              from your partner bank.
            </p>
          </div>
          <div className="mt-7 sm:mt-10">
            <FinancingCalculator option={calcOption} onOptionChange={setCalcOption} />
          </div>
        </div>
      </section>

      <section className="container-page section-y">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              Next: apply and prepare your file
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Start the application, then gather bank documents against your UZA ID.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/apply">Apply for training</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/requirements">Requirements</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
