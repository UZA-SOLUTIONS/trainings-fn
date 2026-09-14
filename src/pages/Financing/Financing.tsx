import { useState } from "react";
import { Link } from "react-router-dom";
import { BUY_OPTIONS } from "@/content/marketing";
import {
  FinancingCalculator,
  type PayOption,
} from "@/components/financing/FinancingCalculator";

const ACCESS = [
  {
    title: "Declare your deposit",
    body: "State what you can put down in cash. The bank’s rule is still 10% up to 25M RWF, or 15% from 26M — that target does not move.",
  },
  {
    title: "UZA Access tops up the gap",
    body: "When your cash falls short of the required deposit, UZA Access can bridge the difference — recorded on your UZA ID and visible to the partner bank.",
  },
  {
    title: "Recovered fairly after delivery",
    body: "The top-up is not a gift. It is recovered on agreed terms after you are on the road, so loan review can start with a complete deposit signal.",
  },
] as const;

export default function Financing() {
  const [option, setOption] = useState<PayOption>("financed");

  return (
    <main className="overflow-x-clip">
      <section className="relative flex min-h-[90vh] flex-col overflow-hidden bg-black">
        <img
          src="/buy-financed-ev.png"
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
            Financing
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm font-medium tracking-wide text-white/95 underline decoration-white/75 underline-offset-[5px] sm:mt-3.5 sm:text-base md:text-lg animate-in fade-in duration-700">
            Three ways in. Every one ends in an EV.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row sm:gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <a
              href="#calculator"
              className="inline-flex h-10 min-w-[14rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:h-11 sm:min-w-[15.5rem] sm:text-[15px]"
            >
              Open calculator
            </a>
            <Link
              to="/requirements"
              className="inline-flex h-10 min-w-[14rem] items-center justify-center rounded-md bg-volt px-6 text-sm font-medium text-volt-foreground transition-colors hover:bg-volt/90 sm:h-11 sm:min-w-[15.5rem] sm:text-[15px]"
            >
              See requirements
            </Link>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="scroll-mt-20 px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
            Know the number before you sign
            <span className="mt-1 block text-primary">Cash, split, or bank-financed</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
            Pick the path that matches your cash flow. Discounts, deposits, and daily
            instalments all hang off the same UZA ID you get when you apply.
          </p>
        </div>
      </section>

      {/* Three paths — alternating splits */}
      {BUY_OPTIONS.map((opt, i) => {
        const imageLeft = i % 2 === 1;
        const n = String(i + 1).padStart(2, "0");

        return (
          <section
            key={opt.slug}
            id={opt.slug}
            className="scroll-mt-20 px-4 pb-8 sm:px-6 sm:pb-10 md:px-8 md:pb-12 lg:px-10"
          >
            <div className="grid min-h-[min(72vh,40rem)] gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
              <div
                className={`flex flex-col justify-center rounded-3xl bg-[#f4f4f4] px-6 py-14 sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-14 lg:px-16 xl:px-20 ${
                  imageLeft ? "order-1 lg:order-2" : "order-1"
                }`}
              >
                <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  {n} · {opt.tag}
                </p>
                <h2 className="mt-3 max-w-xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
                  {opt.title}
                  <span className="mt-1 block text-primary">
                    {opt.discount} {opt.discountLabel}
                  </span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:mt-5 sm:text-[15px]">
                  {opt.body}
                </p>
                <ul className="mt-8 space-y-3 sm:mt-10">
                  {opt.points.map((point) => (
                    <li
                      key={point}
                      className="flex gap-3 text-sm leading-relaxed text-neutral-600 sm:text-[15px]"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setOption(opt.option);
                      document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex h-11 min-w-[11.5rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Model this path
                  </button>
                  <Link
                    to={`/buy/${opt.slug}`}
                    className="inline-flex h-11 min-w-[11.5rem] items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
                  >
                    Full details
                  </Link>
                </div>
              </div>

              <div
                className={`relative min-h-[22rem] overflow-hidden rounded-3xl sm:min-h-[28rem] sm:rounded-[2rem] lg:min-h-full ${
                  imageLeft ? "order-2 lg:order-1" : "order-2"
                }`}
              >
                <img
                  src={opt.image}
                  alt={opt.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                  aria-hidden
                />
                <p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-white sm:bottom-8 sm:text-base">
                  {opt.tag} path — same UZA ID through delivery.
                </p>
              </div>
            </div>
          </section>
        );
      })}

      {/* UZA Access — image left */}
      <section
        id="uza-access"
        className="scroll-mt-20 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-10"
      >
        <div className="grid min-h-[min(72vh,40rem)] gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="relative order-2 min-h-[22rem] overflow-hidden rounded-3xl sm:min-h-[28rem] sm:rounded-[2rem] lg:order-1 lg:min-h-full">
            <img
              src="/viewpoint-bank-ev.png"
              alt="Bank and financing partnership for EV ownership"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              aria-hidden
            />
            <p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-white sm:bottom-8 sm:text-base">
              Deposit signals the bank can trust.
            </p>
          </div>

          <div className="order-1 flex flex-col justify-center rounded-3xl bg-[#f4f4f4] px-6 py-14 sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-14 lg:order-2 lg:px-16 xl:px-20">
            <h2 className="max-w-xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
              When the deposit falls short
              <span className="mt-1 block text-primary">UZA Access can bridge the gap</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:mt-5 sm:text-[15px]">
              Partner banks still need their percentage. Drivers often have earnings — but not
              always the full cash deposit on day one. That is the handoff we close.
            </p>

            <div className="mt-10 space-y-8 sm:mt-12">
              {ACCESS.map((item) => (
                <div key={item.title}>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section
        id="calculator"
        className="scroll-mt-20 px-4 py-10 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-10"
      >
        <div className="mb-8 max-w-3xl sm:mb-10">
          <h2 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
            Run your numbers
            <span className="mt-1 block text-primary">Before you commit</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
            Adjust vehicle cost, deposit, and term. Switch between cash, split, and financed
            to see what the road looks like in RWF.
          </p>
        </div>
        <FinancingCalculator option={option} onOptionChange={setOption} />
      </section>

      {/* Closing */}
      <section className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10">
        <div className="grid min-h-[min(56vh,32rem)] gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="flex flex-col justify-center rounded-3xl bg-[#f4f4f4] px-6 py-14 sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-14 lg:px-16">
            <h2 className="max-w-xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
              Ready to choose a path?
              <span className="mt-1 block text-primary">Start with your UZA ID</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
              Apply for training, complete your bank file, then lock in cash, split, or
              financed — with UZA Access if the deposit needs a bridge.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/apply"
                className="inline-flex h-11 min-w-[11.5rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Apply now
              </Link>
              <Link
                to="/requirements"
                className="inline-flex h-11 min-w-[11.5rem] items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
              >
                View requirements
              </Link>
            </div>
          </div>

          <div className="relative min-h-[18rem] overflow-hidden rounded-3xl sm:min-h-[24rem] sm:rounded-[2rem] lg:min-h-full">
            <img
              src="/calculator-forest.png"
              alt="UZA financing journey"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
              aria-hidden
            />
          </div>
        </div>
      </section>
    </main>
  );
}
