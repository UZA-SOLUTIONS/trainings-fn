import { Link, Navigate, useParams } from "react-router-dom";
import { EXPO_STORIES, getExpoStoryBySlug } from "@/content/marketing";

const STORY_DETAIL: Record<
  string,
  { lead: string; paragraphs: string[] }
> = {
  launch: {
    lead: "At the mobility expo we opened the UZA Mobility stand and put the full programme in front of drivers, partners, and the public.",
    paragraphs: [
      "Visitors walked through how one UZA ID follows a driver from application and training to bank documents, financing, and vehicle delivery.",
      "It was the first public floor where we showed the live path: train, finance with partner banks, and drive an EV you are working to own.",
    ],
  },
  drivers: {
    lead: "Taxi drivers stopped by to ask about deposits, training seats, and when a car could be allocated.",
    paragraphs: [
      "We sat with operators who wanted a clearer route than informal loans, and showed how cohort training and a shared record keep every step visible.",
      "Interest cards and early applications started on the floor, with drivers leaving knowing exactly what to bring next.",
    ],
  },
  banks: {
    lead: "Bank partners joined the stand to talk risk, equity, and how UZA Access can bridge a deposit gap.",
    paragraphs: [
      "Drivers heard the same story the bank sees: documents, contribution, and readiness in one folder.",
      "The expo made bank-funded ownership feel concrete for taxi work, not a distant brochure promise.",
    ],
  },
};

export default function ExpoNews() {
  const { slug = "" } = useParams();
  const story = getExpoStoryBySlug(slug);
  const detail = STORY_DETAIL[slug];

  if (!story || !detail) {
    return <Navigate to="/#news" replace />;
  }

  return (
    <main className="bg-background">
      <section className="px-6 pb-8 pt-10 text-center sm:px-10 sm:pb-10 sm:pt-14 md:px-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {story.label}
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {story.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500 sm:mt-5 sm:text-base md:text-lg">
          {detail.lead}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Link
            to="/apply"
            className="inline-flex h-10 min-w-[12rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:h-11"
          >
            Apply now
          </Link>
          <Link
            to="/financing"
            className="inline-flex h-10 min-w-[12rem] items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 sm:h-11"
          >
            See financing
          </Link>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-8 md:px-12 lg:px-14">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
          <img
            src={story.image}
            alt={story.imageAlt}
            className="aspect-[16/10] w-full object-cover object-center sm:min-h-[52vh] md:min-h-[58vh]"
          />
        </div>
      </section>

      <section className="mx-auto max-w-2xl space-y-4 px-6 pb-16 pt-4 text-center sm:px-10 sm:pb-20 md:px-16">
        {detail.paragraphs.map((p) => (
          <p key={p} className="text-sm leading-relaxed text-neutral-600 sm:text-base">
            {p}
          </p>
        ))}
      </section>

      <section className="border-t border-border/50 bg-neutral-950 px-4 py-12 sm:px-6 sm:py-16 md:px-8 lg:px-10">
        <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-volt">
          More from the expo
        </p>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {EXPO_STORIES.filter((s) => s.slug !== story.slug).map((s) => (
            <Link
              key={s.slug}
              to={`/news/${s.slug}`}
              className="overflow-hidden rounded-xl bg-neutral-900 text-white transition-opacity hover:opacity-95 sm:rounded-2xl"
            >
              <div className="relative aspect-[4/3]">
                <img
                  src={s.image}
                  alt={s.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="px-5 py-5">
                <h2 className="font-display text-lg font-semibold tracking-tight">{s.title}</h2>
                <p className="mt-2 text-sm text-white/70 line-clamp-2">{s.body}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
