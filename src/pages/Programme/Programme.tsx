import { Link } from "react-router-dom";
import { PageHero } from "@/components/layout/PageHero";
import { StepsJourney } from "@/components/home/StepsJourney";
import { PartnersSection } from "@/components/marketing/PartnersSection";
import { PROGRAMME_STEPS } from "@/content/marketing";
import { Button } from "@/components/ui/button";

export default function Programme() {
  return (
    <main>
      <PageHero
        eyebrow="The path to ownership"
        title="Six steps, one ID, nothing lost between offices."
        description="Every driver follows the same journey — training, documents, financing, allocation, and delivery — all under one permanent UZA ID that banks and UZA share."
        primary={{ label: "Apply for training", to: "/apply" }}
        secondary={{ label: "See open cohorts", to: "/training" }}
      />

      <section className="container-page section-y">
        <div className="max-w-3xl">
          <p className="text-eyebrow text-muted-foreground">How it works</p>
          <h2 className="mt-2 text-[1.65rem] font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
            Watch each stage unlock in sequence.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Click any step or let the path advance automatically. This is the same record driver,
            bank, and UZA operations use.
          </p>
        </div>
        <StepsJourney steps={[...PROGRAMME_STEPS]} />
      </section>

      <PartnersSection />

      <section className="container-page section-y">
        <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-xl">
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
              Ready to start?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Apply for a cohort, then track your UZA ID through training and financing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/apply">Apply</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/financing">See financing</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/track">Track ID</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
