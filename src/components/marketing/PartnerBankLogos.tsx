import { PARTNER_BANKS } from "@/content/marketing";

/** Bank partner logos under the partners block. */
export function PartnerBankLogos() {
  return (
    <div
      id="partner-banks"
      aria-labelledby="partner-banks-heading"
      className="scroll-mt-20 border-t border-border/50 bg-muted/25 py-14 sm:py-16 md:py-20"
    >
      <div className="container-page">
        <h2
          id="partner-banks-heading"
          className="text-center text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl"
        >
          Partners
        </h2>
        <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-10 sm:mt-12 sm:gap-x-24 md:gap-x-28">
          {PARTNER_BANKS.map((bank) => (
            <li key={bank.name}>
              <img
                src={bank.logo}
                alt={bank.name}
                className="h-16 w-auto max-w-[14rem] object-contain sm:h-20 sm:max-w-[18rem] md:h-24 md:max-w-[20rem]"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
