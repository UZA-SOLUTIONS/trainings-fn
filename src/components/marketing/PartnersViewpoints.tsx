import { FiBriefcase, FiTruck, FiUser } from "react-icons/fi";
import { PARTNER_PORTALS } from "@/content/marketing";
import { ScrollReveal } from "@/components/marketing/ScrollReveal";
import { cn } from "@/lib/utils";

const VIEWPOINT_ICONS = [FiUser, FiBriefcase, FiTruck] as const;

/** Viewpoint panels: driver, bank, and UZA operations — one shared record. */
export function PartnersViewpoints() {
  return (
    <div className="relative overflow-hidden bg-background section-y">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 0% 0%, oklch(0.35 0.06 158 / 0.08), transparent 55%),
            radial-gradient(ellipse 55% 40% at 100% 100%, oklch(0.85 0.16 128 / 0.12), transparent 50%)
          `,
        }}
      />

      <div className="container-page relative">
        <header className="max-w-3xl">
          <ScrollReveal
            origin="left"
            baseOpacity={0.1}
            enableBlur
            baseRotation={2}
            blurStrength={4}
            containerClassName="text-foreground"
            textClassName="sm:text-[2rem] md:text-[2.5rem]"
          >
            Same data, three points of view.
          </ScrollReveal>
          <ScrollReveal
            as="p"
            origin="left"
            baseOpacity={0.15}
            enableBlur
            baseRotation={1.5}
            blurStrength={3}
            containerClassName="mt-3 text-muted-foreground sm:mt-4"
            textClassName="scroll-reveal-text--body"
          >
            Each partner bank keeps its own checklist, deposit rule, and collateral policy. One shared
            UZA record feeds the driver, the bank, and operations without rebuilding the platform.
          </ScrollReveal>
        </header>

        <div
          className="partners-shared mt-10 flex items-center gap-3 sm:mt-12 sm:gap-4"
          aria-hidden
        >
          <span className="h-px flex-1 bg-border/80" />
          <span className="shrink-0 rounded-xl border border-border/70 bg-background px-3.5 py-1.5 text-eyebrow text-muted-foreground">
            One shared UZA record
          </span>
          <span className="h-px flex-1 bg-border/80" />
        </div>

        <div className="relative mt-8 grid gap-4 sm:mt-10 sm:grid-cols-3 sm:gap-5 lg:gap-6">
          <div
            className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-0 hidden h-px bg-border/60 sm:block"
            aria-hidden
          />

          {PARTNER_PORTALS.map((p, i) => {
            const Icon = VIEWPOINT_ICONS[i] ?? FiUser;
            const index = String(i + 1).padStart(2, "0");

            return (
              <article
                key={p.title}
                className="partners-lens group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-background/90 p-6 backdrop-blur-sm transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-primary/40 sm:rounded-[2rem] sm:p-7 lg:p-8"
                style={{ animationDelay: `${80 + i * 90}ms` }}
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-volt transition-transform duration-300 group-hover:scale-x-100" />

                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-volt group-hover:text-volt-foreground">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className="font-display text-sm font-medium tabular-nums tracking-wide text-muted-foreground">
                    {index}
                  </span>
                </div>

                <p className="mt-6 text-eyebrow text-muted-foreground">Viewpoint</p>

                <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {p.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {p.lens}
                </p>

                <ul className="mt-6 space-y-3 border-t border-border/60 pt-5">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-sm leading-snug text-foreground/90">
                      <span
                        className={cn(
                          "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/70 transition-colors duration-300 group-hover:bg-volt",
                        )}
                        aria-hidden
                      />
                      {pt}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
