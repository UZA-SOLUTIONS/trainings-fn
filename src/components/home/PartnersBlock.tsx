import { PartnersViewpoints } from "@/components/marketing/PartnersViewpoints";
import { PartnerBankLogos } from "@/components/marketing/PartnerBankLogos";

/** Partners family: shared-record viewpoints, then bank logos. */
export function PartnersBlock() {
  return (
    <section id="partners" className="scroll-mt-20 border-t border-border/50">
      <PartnersViewpoints />
      <PartnerBankLogos />
    </section>
  );
}
