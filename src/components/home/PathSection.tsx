import { StepsJourney } from "@/components/home/StepsJourney";
import { PROGRAMME_STEPS } from "@/content/marketing";

export function PathSection() {
  return (
    <section id="path" className="section-y scroll-mt-20">
      <div className="container-page">
        <div className="max-w-3xl">
          <h2 className="text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
            How it works
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">
            Six steps, one ID — nothing lost between offices.
          </p>
        </div>
        <StepsJourney steps={[...PROGRAMME_STEPS]} />
      </div>
    </section>
  );
}
