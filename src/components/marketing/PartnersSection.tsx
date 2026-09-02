import { PARTNER_PORTALS, SHARED_RECORD } from "@/content/marketing";

export function PartnersSection() {
  return (
    <section
      id="partners"
      className="relative overflow-hidden border-t border-border/50 text-ink-foreground section-y"
    >
      <img
        src="/hero.avif"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[oklch(0.16_0.04_158)]/86 md:bg-[oklch(0.16_0.04_158)]/82" />
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 55% at 10% 0%, oklch(0.35 0.08 158 / 0.35), transparent 55%),
            radial-gradient(ellipse 60% 45% at 95% 90%, oklch(0.7 0.18 128 / 0.1), transparent 50%)
          `,
        }}
      />

      <div className="relative container-page">
        <div className="max-w-3xl">
          <p className="text-eyebrow text-ink-foreground/50">Built for partnerships</p>
          <h2 className="mt-1.5 text-[1.4rem] font-bold leading-tight tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
            Same data, three points of view.
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-snug text-ink-foreground/70 sm:mt-4 sm:text-base sm:leading-relaxed">
            Each partner financial institution defines its own document checklist, deposit rule and
            collateral policy. Add an institution without changing the platform.
          </p>
        </div>

        <div className="partners-shared mt-5 border border-ink-foreground/12 bg-ink-foreground/[0.04] px-3 py-3 sm:mt-12 sm:px-5 sm:py-5 md:px-8 md:py-6">
          <div className="flex flex-col gap-2.5 sm:gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <div className="shrink-0">
              <p className="text-eyebrow text-volt">Shared record</p>
              <p className="mt-0.5 text-xs text-ink-foreground/55 sm:mt-1 sm:text-sm">
                One source of truth for every partner
              </p>
            </div>
            <ul className="flex flex-wrap gap-1.5 sm:items-center sm:gap-x-1 sm:gap-y-2 md:justify-end">
              {SHARED_RECORD.map((item) => (
                <li key={item}>
                  <span className="inline-flex rounded-full border border-ink-foreground/15 px-2 py-0.5 font-display text-[11px] font-medium tracking-wide text-ink-foreground/90 sm:border-0 sm:px-0 sm:py-0 sm:text-[13px]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-5 md:grid-cols-3">
          {PARTNER_PORTALS.map((p, i) => (
            <article
              key={p.title}
              className="partners-lens group relative overflow-hidden rounded-2xl border border-white/80 border-b-0 bg-white px-5 py-6 text-foreground sm:px-6 sm:py-8"
              style={{ animationDelay: `${120 + i * 90}ms` }}
            >
              <div className="flex items-baseline justify-between gap-3 sm:gap-4">
                <span className="font-display text-[1.75rem] font-bold leading-none tracking-tight text-volt transition-opacity duration-300 group-hover:opacity-90 sm:text-5xl md:text-6xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-eyebrow text-muted-foreground">Viewpoint</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground sm:mt-6 sm:text-2xl">
                {p.title}
              </h3>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground sm:mt-2 sm:text-sm sm:leading-relaxed">
                {p.lens}
              </p>
              <ul className="mt-3.5 space-y-2 sm:mt-8 sm:space-y-4">
                {p.points.map((pt) => (
                  <li
                    key={pt}
                    className="flex items-start gap-2.5 text-[13px] text-foreground/85 sm:gap-3 sm:text-sm"
                  >
                    <span className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 bg-volt" aria-hidden />
                    <span className="leading-snug sm:leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 bg-volt"
                aria-hidden
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
