import { Link } from "react-router-dom";

const SERVICES = [
  {
    n: "01",
    title: "Driver training",
    body: "Cohorts that prepare professional taxi drivers for EV ownership — road habits, vehicle care, and a bank-ready file — so graduation means more than a certificate.",
  },
  {
    n: "02",
    title: "Bank document file",
    body: "Guided checklists for each partner bank. Drivers upload item by item against one UZA ID; incomplete files stay open until every required document is in.",
  },
  {
    n: "03",
    title: "EV financing paths",
    body: "Pay in full, split, or bank financed. When the deposit falls short of the bank’s 10–15% rule, UZA Access can top up the gap — recorded, visible to the bank, recovered fairly.",
  },
  {
    n: "04",
    title: "Vehicle allocation & delivery",
    body: "Approved drivers are linked to a specific car when stock sails. Sea freight and inland updates sit on the same record the driver and bank already use.",
  },
] as const;

const HELP = [
  {
    title: "For drivers",
    body: "A clear path from training seat to keys — one ID to track progress, fewer lost papers, and financing options that match real earnings on the road.",
  },
  {
    title: "For partner banks",
    body: "Verified cohort folders, complete document files, and deposit signals they can trust — so loan review starts with evidence, not chasing missing pages.",
  },
  {
    title: "For families & communities",
    body: "Ownership instead of endless rental. Cleaner electric taxis on Kigali’s streets, and income that builds toward something that stays with the driver.",
  },
] as const;

export default function About() {
  return (
    <main className="overflow-x-clip">
      <section className="relative flex min-h-[90vh] flex-col overflow-hidden bg-black">
        <img
          src="/1.jpg"
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
            Our story
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm font-medium tracking-wide text-white/95 underline decoration-white/75 underline-offset-[5px] sm:mt-3.5 sm:text-base md:text-lg animate-in fade-in duration-700">
            How a simple question became a path to EV ownership.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row sm:gap-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
            <Link
              to="/apply"
              className="inline-flex h-10 min-w-[14rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:h-11 sm:min-w-[15.5rem] sm:text-[15px]"
            >
              Join the programme
            </Link>
            <Link
              to="/requirements"
              className="inline-flex h-10 min-w-[14rem] items-center justify-center rounded-md bg-volt px-6 text-sm font-medium text-volt-foreground transition-colors hover:bg-volt/90 sm:h-11 sm:min-w-[15.5rem] sm:text-[15px]"
            >
              See requirements
            </Link>
          </div>
        </div>
      </section>

      {/* Origin story */}
      <section className="mt-8 scroll-mt-20 px-4 sm:mt-10 sm:px-6 md:mt-12 md:px-8 lg:px-10">
        <div className="grid min-h-[min(72vh,40rem)] gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="flex flex-col justify-center rounded-3xl bg-[#f4f4f4] px-6 py-14 sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-14 lg:px-16 xl:px-20">
            <h2 className="max-w-xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem] lg:text-[3.15rem]">
              Where the idea started
              <span className="mt-1 block text-primary">Drivers asked for a way in</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:mt-5 sm:text-[15px]">
              Across Kigali, skilled taxi drivers were already putting in the hours — yet many
              stayed on rented cars, with no clear route to own a cleaner electric vehicle.
              Banks wanted complete files. Drivers had earnings, but not always the deposit,
              the paperwork, or a single place that held everything together.
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
              UZA Mobility grew from that gap: train first, build a bank-ready file, open real
              financing options, then allocate and deliver an EV — all under one permanent UZA ID
              that the driver, the bank, and our team share.
            </p>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-3xl sm:min-h-[28rem] sm:rounded-[2rem] lg:min-h-full">
            <img
              src="/ev.avif"
              alt="UZA electric vehicle on the road"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              aria-hidden
            />
            <p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-white sm:bottom-8 sm:text-base">
              From rented shifts to a vehicle that is yours.
            </p>
          </div>
        </div>
      </section>

      {/* How we help — image left, copy right */}
      <section className="scroll-mt-20 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-10">
        <div className="grid min-h-[min(72vh,40rem)] gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="relative order-2 min-h-[22rem] overflow-hidden rounded-3xl sm:min-h-[28rem] sm:rounded-[2rem] lg:order-1 lg:min-h-full">
            <img
              src="/bg.jpg"
              alt="Taxi drivers and electric mobility in the city"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
              aria-hidden
            />
            <p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-white sm:bottom-8 sm:text-base">
              Help that shows up as a clear path to ownership.
            </p>
          </div>

          <div className="order-1 flex flex-col justify-center rounded-3xl bg-[#f4f4f4] px-6 py-14 sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-14 lg:order-2 lg:px-16 xl:px-20">
            <h2 className="max-w-xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
              How we help people
              <span className="mt-1 block text-primary">Drivers, banks, communities</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:mt-5 sm:text-[15px]">
              We do not only sell cars. We close the handoffs that used to stall ownership —
              missing documents, unclear deposits, and no shared status after training.
            </p>

            <div className="mt-10 space-y-8 sm:mt-12">
              {HELP.map((item) => (
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

      {/* What we offer — split: services left, photo right */}
      <section className="scroll-mt-20 px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-10">
        <div className="grid min-h-[min(72vh,44rem)] gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="flex flex-col justify-center rounded-3xl bg-[#f4f4f4] px-6 py-14 sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-14 lg:px-16 xl:px-20">
            <h2 className="max-w-xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[2.75rem]">
              What we offer
              <span className="mt-1 block text-primary">Services on one UZA ID</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:mt-5 sm:text-[15px]">
              Everything below hangs off the same candidate ID — so progress is visible from
              the first training day to delivery.
            </p>

            <ol className="mt-10 space-y-0 sm:mt-12">
              {SERVICES.map((s, i) => (
                <li
                  key={s.n}
                  className={`grid gap-3 border-b border-neutral-200/90 py-5 sm:grid-cols-[3.25rem_1fr] sm:gap-4 sm:py-5 ${
                    i === 0 ? "border-t border-neutral-200/90" : ""
                  }`}
                >
                  <span className="font-display text-2xl font-semibold tracking-tight text-primary/30 sm:text-3xl">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold tracking-tight text-foreground sm:text-lg">
                      {s.title}
                    </h3>
                    <p className="mt-1 max-w-md text-sm leading-relaxed text-neutral-500">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative min-h-[22rem] overflow-hidden rounded-3xl sm:min-h-[28rem] sm:rounded-[2rem] lg:min-h-full">
            <img
              src="/viewpoint-driver-ev.png"
              alt="Driver with UZA electric vehicle"
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
              aria-hidden
            />
            <p className="absolute inset-x-4 bottom-6 text-center text-sm font-medium text-white sm:bottom-8 sm:text-base">
              Training, documents, financing, delivery — one ID.
            </p>
          </div>
        </div>
      </section>

      {/* Promise strip */}
      <section className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-10">
        <div className="grid min-h-[min(56vh,32rem)] gap-4 sm:gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="relative min-h-[18rem] overflow-hidden rounded-3xl sm:min-h-[24rem] sm:rounded-[2rem] lg:min-h-full">
            <img
              src="/hero.avif"
              alt="UZA fleet on the road"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
              aria-hidden
            />
          </div>

          <div className="flex flex-col justify-center rounded-3xl bg-[#f4f4f4] px-6 py-14 sm:rounded-[2rem] sm:px-10 sm:py-16 md:px-14 lg:px-16">
            <h2 className="max-w-xl font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
              Built for people who drive for a living
              <span className="mt-1 block text-primary">Not a showroom promise</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-[15px]">
              We stay with the driver after the application form — through training seats,
              bank reviews, deposit gaps, and the wait for a container. That is the help
              we set out to give: a fair, trackable route into electric ownership.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/apply"
                className="inline-flex h-11 min-w-[11.5rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Apply now
              </Link>
              <Link
                to="/track"
                className="inline-flex h-11 min-w-[11.5rem] items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
              >
                Track your ID
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
