import { Link } from "react-router-dom";

/**
 * Tesla-style split feature block directly under the hero:
 * copy + stats + CTAs on the left, full-bleed photo on the right.
 */
export function PathSection() {
  return (
    <section id="path" className="mt-8 scroll-mt-20 px-4 sm:mt-10 sm:px-6 md:mt-12 md:px-8 lg:px-10">
      <div className="grid min-h-[min(72vh,40rem)] gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col justify-center rounded-3xl bg-[#f4f4f4] px-6 py-14 sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-14 lg:px-16 xl:px-20">
          <h2 className="max-w-xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] lg:text-[3.15rem]">
            How it works
            <span className="mt-1 block text-primary">One UZA ID</span>
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:mt-5 sm:text-[15px]">
            From training to delivery in six steps. Driver, bank, and operations
            share one live record so every handoff stays clear.
          </p>

          <div className="mt-10 flex flex-wrap gap-x-12 gap-y-8 sm:mt-12">
            <div>
              <p className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                <span className="text-primary/35">0</span>6
              </p>
              <p className="mt-1.5 text-sm text-neutral-500">Programme steps</p>
            </div>
            <div>
              <p className="font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
                <span className="text-primary/35">0</span>1
              </p>
              <p className="mt-1.5 text-sm text-neutral-500">Shared UZA ID</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:items-center">
            <Link
              to="/apply"
              className="inline-flex h-10 min-w-[11.5rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:h-11"
            >
              Apply now
            </Link>
            <Link
              to="/track"
              className="inline-flex h-10 min-w-[11.5rem] items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 sm:h-11"
            >
              Track your ID
            </Link>
          </div>
        </div>

        <div className="relative min-h-[22rem] overflow-hidden rounded-3xl sm:min-h-[28rem] sm:rounded-[2rem] lg:min-h-full">
          <img
            src="/ev.avif"
            alt="UZA electric vehicle interior and road view"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent"
            aria-hidden
          />
          <p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-white sm:bottom-8 sm:text-base">
            One ID from application to your door.
          </p>
        </div>
      </div>
    </section>
  );
}
