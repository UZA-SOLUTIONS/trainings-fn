import { Link } from "react-router-dom";
import { EXPO_STORIES } from "@/content/marketing";

/** Toyota-style featured stories: title + button; description on hover. */
export function ExpoStories() {
  return (
    <section id="news" className="scroll-mt-20 bg-background py-12 sm:py-16 md:py-20">
      <div className="px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <div className="grid gap-8 sm:gap-9 md:grid-cols-3 md:gap-10 lg:gap-12">
          {EXPO_STORIES.map((story) => (
            <article
              key={story.slug}
              className="group relative flex min-h-[36rem] flex-col overflow-hidden rounded-xl bg-neutral-950 text-white sm:min-h-[40rem] sm:rounded-2xl md:min-h-[42rem]"
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={story.image}
                  alt={story.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `
                      linear-gradient(180deg, oklch(0.2 0.03 250 / 0.28) 0%, transparent 45%),
                      linear-gradient(180deg, transparent 35%, oklch(0.12 0.02 250 / 0.62) 100%),
                      linear-gradient(120deg, oklch(0.45 0.04 240 / 0.22) 0%, transparent 55%, oklch(0.35 0.05 50 / 0.12) 100%)
                    `,
                  }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-soft-light opacity-70"
                  style={{
                    background:
                      "radial-gradient(ellipse 90% 60% at 40% 15%, oklch(0.85 0.04 80 / 0.25), transparent 60%)",
                  }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-black/70 via-black/30 to-transparent sm:h-60"
                  aria-hidden
                />
              </div>

              <div className="relative mt-auto flex flex-col px-5 pb-6 pt-24 sm:px-6 sm:pb-7">
                <h3 className="font-display text-xl font-semibold leading-snug tracking-tight transition-transform duration-300 ease-out group-hover:-translate-y-2 sm:text-2xl sm:group-hover:-translate-y-3">
                  {story.title}
                </h3>
                <p className="mt-0 max-h-0 overflow-hidden text-sm leading-relaxed text-white/80 opacity-0 transition-all duration-300 ease-out group-hover:mt-2 group-hover:max-h-24 group-hover:opacity-100">
                  {story.body}
                </p>
                <div className="mt-4">
                  <Link
                    to={story.cta.href}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
                  >
                    {story.cta.label}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
