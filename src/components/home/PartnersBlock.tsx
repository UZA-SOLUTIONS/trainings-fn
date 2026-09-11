import { PartnersViewpoints } from "@/components/marketing/PartnersViewpoints";
import { ExpoStories } from "@/components/marketing/ExpoStories";
import { PartnerBankLogos } from "@/components/marketing/PartnerBankLogos";

/** Partners family: viewpoints, expo stories, then bank logos. */
export function PartnersBlock() {
  return (
    <section id="partners" className="scroll-mt-20">
      <PartnersViewpoints />
      <ExpoStories />
      <PartnerBankLogos />
    </section>
  );
}
