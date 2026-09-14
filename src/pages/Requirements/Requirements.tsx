import { Link } from "react-router-dom";
import { BANK_REQUIREMENTS, OBSTACLES, depositRequirement } from "@/constants/bank-requirements";
import { formatRwf } from "@/utils/financing";
import { cn } from "@/lib/utils";

const EXAMPLES = [15_000_000, 25_000_000, 28_000_000];

export default function Requirements() {
  return (
    <main className="overflow-x-clip">
      {/* Full-bleed hero — matches HomeHero composition */}
      <section className="relative flex min-h-[90vh] flex-col overflow-hidden bg-black">
        <img
          src="/hero.avif"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.08)_28%,rgba(0,0,0,0.12)_62%,rgba(0,0,0,0.45)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[oklch(0.28_0.06_158_/0.18)]"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-[90vh] flex-1 flex-col items-center justify-center px-4 pb-20 pt-24 text-center text-white">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80 animate-in fade-in duration-700">
            UZA Mobility
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl animate-in fade-in slide-in-from-bottom-2 duration-700">
            What the bank needs
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium tracking-wide text-white/95 underline decoration-white/75 underline-offset-[5px] sm:mt-3.5 sm:text-base md:text-lg animate-in fade-in duration-700">
            One file. One UZA ID. From training to loan review.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row sm:gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <Link
              to="/apply"
              className="inline-flex h-10 min-w-[14rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:h-11 sm:min-w-[15.5rem] sm:text-[15px]"
            >
              Start your application
            </Link>
            <Link
              to="/financing"
              className="inline-flex h-10 min-w-[14rem] items-center justify-center rounded-md bg-volt px-6 text-sm font-medium text-volt-foreground transition-colors hover:bg-volt/90 sm:h-11 sm:min-w-[15.5rem] sm:text-[15px]"
            >
              See financing
            </Link>
          </div>
        </div>
      </section>

      {/* Document checklist — PathSection panel language */}
      <section
        id="documents"
        className="scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
            Bank document file
            <span className="mt-1 block text-primary">Bring these with you</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
            Upload against your permanent candidate ID, or hand them to your instructor.
            Conditional items only apply to some drivers.
          </p>

          <ol className="mt-12 space-y-0">
            {BANK_REQUIREMENTS.map((r, i) => (
              <li
                key={r.key}
                className={cn(
                  "grid gap-3 border-b border-neutral-200/80 py-6 sm:grid-cols-[4.5rem_1fr] sm:gap-6 sm:py-7",
                  i === 0 && "border-t border-neutral-200/80",
                )}
              >
                <span className="font-display text-3xl font-semibold tracking-tight text-primary/30 sm:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      {r.label}
                    </h3>
                    {r.conditional ? (
                      <span className="text-sm font-medium text-primary">{r.conditional}</span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
                    {r.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Deposit tiers — Tesla-style split like PathSection */}
      <section
        id="deposit"
        className="scroll-mt-20 px-4 pb-12 sm:px-6 sm:pb-16 md:px-8 md:pb-20 lg:px-10"
      >
        <div className="grid min-h-[min(72vh,40rem)] gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="flex flex-col justify-center rounded-3xl bg-[#f4f4f4] px-6 py-14 sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-14 lg:px-16">
            <h2 className="max-w-xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
              Deposit tiers
              <span className="mt-1 block text-primary">Cash or collateral</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:mt-5 sm:text-[15px]">
              10% of the vehicle price up to 25M RWF, 15% from 26M RWF. If you cannot raise
              the cash, pledge collateral above 30% of the vehicle value — or ask UZA Access
              to top up the gap.
            </p>

            <div className="mt-10 space-y-8 sm:mt-12">
              {EXAMPLES.map((price) => {
                const req = depositRequirement(price);
                return (
                  <div key={price} className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-sm text-neutral-500">
                        {formatRwf(price, { compact: true })} vehicle
                      </p>
                      <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        {formatRwf(req.amount, { compact: true })}
                      </p>
                    </div>
                    <p className="pb-1 text-sm text-neutral-500">
                      {Math.round(req.percent * 100)}% deposit
                      <span className="mx-1.5 text-neutral-300">|</span>
                      collateral above {formatRwf(req.collateralAmount, { compact: true })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-3xl sm:min-h-[28rem] sm:rounded-[2rem] lg:min-h-full">
            <img
              src="/ev.avif"
              alt="UZA electric vehicle"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              aria-hidden
            />
            <p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-white sm:bottom-8 sm:text-base">
              Deposit proof sits on the same UZA ID as your training.
            </p>
          </div>
        </div>
      </section>

      {/* Obstacles */}
      <section
        id="obstacles"
        className="scroll-mt-20 border-t border-neutral-200/80 bg-[#f4f4f4] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10"
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
            Possible obstacles
            <span className="mt-1 block text-primary">Clear these first</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
            Other than these, nothing else should stand between you and this loan.
          </p>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-12">
            {OBSTACLES.map((o) => (
              <div key={o.title}>
                <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  {o.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
                  {o.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 lg:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Ready when your file is.
            </h2>
            <p className="mt-2 max-w-md text-sm text-neutral-500 sm:text-[15px]">
              Start the application, then track your UZA ID as documents land.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/apply"
              className="inline-flex h-11 min-w-[11.5rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start your application
            </Link>
            <Link
              to="/track"
              className="inline-flex h-11 min-w-[11.5rem] items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
            >
              Track your ID
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
