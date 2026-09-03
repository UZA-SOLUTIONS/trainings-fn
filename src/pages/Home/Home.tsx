import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HomeHero } from "@/components/home/HomeHero";
import { PathSection } from "@/components/home/PathSection";
import { FinancingSection } from "@/components/home/FinancingSection";
import { PartnersBlock } from "@/components/home/PartnersBlock";
import type { PayOption } from "@/components/financing/FinancingCalculator";

const HOME_HASHES = new Set([
  "path",
  "financing",
  "offers",
  "calculator",
  "partners",
  "partner-banks",
]);

function isPayOption(v: string | null): v is PayOption {
  return v === "cash" || v === "split" || v === "financed";
}

export default function Home() {
  const [params] = useSearchParams();
  const optionParam = params.get("option");
  const [calcOption, setCalcOption] = useState<PayOption>(
    isPayOption(optionParam) ? optionParam : "financed",
  );

  useEffect(() => {
    if (isPayOption(optionParam)) setCalcOption(optionParam);
  }, [optionParam]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!HOME_HASHES.has(hash)) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [params]);

  return (
    <main className="overflow-x-clip">
      <HomeHero />
      <PathSection />
      <FinancingSection option={calcOption} onOptionChange={setCalcOption} />
      <PartnersBlock />
    </main>
  );
}
