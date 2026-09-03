import { PARTNER_PORTALS } from "@/content/marketing";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { cn } from "@/lib/utils";

/** Viewpoint cards: driver, bank, and UZA operations. */
export function PartnersViewpoints() {
  return (
    <div className="relative bg-background section-y">
      <div className="container-page">
        <header className="ml-auto max-w-3xl text-right">
          <ScrollReveal
            origin="right"
            baseOpacity={0.1}
            enableBlur
            baseRotation={3}
            blurStrength={4}
            containerClassName="text-foreground"
            textClassName="sm:text-[2rem] md:text-[2.5rem]"
          >
            Same data, three points of view.
          </ScrollReveal>
          <ScrollReveal
            as="p"
            origin="right"
            baseOpacity={0.15}
            enableBlur
            baseRotation={2}
            blurStrength={3}
            containerClassName="mt-3 text-muted-foreground sm:mt-4"
            textClassName="scroll-reveal-text--body"
          >
            Each partner bank keeps its own checklist, deposit rule, and collateral policy. One shared
            UZA record feeds the driver, the bank, and operations without rebuilding the platform.
          </ScrollReveal>
        </header>

        <div
          className="mt-10 flex h-px w-full items-stretch justify-end bg-border/70 sm:mt-12"
          aria-hidden
        >
          <span className="block h-full w-16 bg-foreground sm:w-24" />
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:items-stretch sm:gap-5 lg:gap-6">
          {PARTNER_PORTALS.map((p, i) => (
            <article
              key={p.title}
              className="partners-lens group flex h-full flex-col bg-muted px-6 py-8 transition-colors duration-300 hover:bg-volt sm:px-7 sm:py-9 lg:px-8 lg:py-10"
              style={{ animationDelay: `${80 + i * 90}ms` }}
            >
              <p
                className={cn(
                  "font-display text-[clamp(3.25rem,8vw,5rem)] font-bold leading-none tracking-tight transition-colors duration-300",
                  "text-transparent [-webkit-text-stroke:1.35px_var(--color-foreground)]",
                  "group-hover:text-primary group-hover:[-webkit-text-stroke:0]",
                )}
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </p>

              <p className="mt-4 text-eyebrow text-muted-foreground transition-colors duration-300 group-hover:text-volt-foreground/70">
                Viewpoint
              </p>

              <h3 className="mt-2 font-display text-xl font-bold lowercase tracking-tight text-foreground transition-colors duration-300 group-hover:text-volt-foreground sm:text-2xl">
                {p.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-foreground/80 transition-colors duration-300 group-hover:text-volt-foreground/85">
                {p.lens}
              </p>

              <ul className="mt-6 space-y-2.5 border-t border-foreground/10 pt-5 transition-colors duration-300 group-hover:border-volt-foreground/20">
                {p.points.map((pt) => (
                  <li
                    key={pt}
                    className="text-sm leading-snug text-muted-foreground transition-colors duration-300 group-hover:text-volt-foreground/80"
                  >
                    {pt}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
