import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

export type JourneyStep = {
  n: string;
  title: string;
  body: string;
};

export function StepsJourney({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.n} className="relative">
          <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-background p-5 transition-colors active:bg-muted/30 sm:p-6 hover:border-primary/35 hover:bg-muted/20">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary sm:h-10 sm:w-10">
                {s.n}
              </span>
              <span className="text-eyebrow text-muted-foreground">
                Step {i + 1} of {steps.length}
              </span>
            </div>
            <h3 className="mt-4 font-display text-base font-semibold leading-snug tracking-tight sm:mt-5 sm:text-lg">
              {s.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground sm:mt-3">
              {s.body}
            </p>
            {s.n === "02" && (
              <Link
                to="/training"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                See cohorts & modules
                <FiArrowRight aria-hidden />
              </Link>
            )}
          </article>
        </li>
      ))}
    </ol>
  );
}
