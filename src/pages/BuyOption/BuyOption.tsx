import { Link, Navigate, useParams } from "react-router-dom";
import { getBuyOptionBySlug } from "@/content/marketing";

/** Tesla-style feature page: centered copy above a cinematic EV still. */
export default function BuyOption() {
  const { slug = "" } = useParams();
  const option = getBuyOptionBySlug(slug);

  if (!option) {
    return <Navigate to="/#financing" replace />;
  }

  return (
    <main className="bg-background">
      <section className="px-6 pb-8 pt-10 text-center sm:px-10 sm:pb-10 sm:pt-14 md:px-16">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {option.discount} {option.discountLabel}
        </p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          {option.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-500 sm:mt-5 sm:text-base md:text-lg">
          {option.body}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Link
            to={`/?option=${option.option}#calculator`}
            className="inline-flex h-10 min-w-[12rem] items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:h-11"
          >
            Compare with calculator
          </Link>
          <Link
            to="/apply"
            className="inline-flex h-10 min-w-[12rem] items-center justify-center rounded-md border border-neutral-300 bg-white px-6 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 sm:h-11"
          >
            Apply now
          </Link>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-8 md:px-12 lg:px-14">
        <div className="overflow-hidden rounded-2xl sm:rounded-3xl">
          <img
            src={option.image}
            alt={option.imageAlt}
            className="aspect-[16/10] w-full object-cover object-center sm:aspect-[16/9] sm:min-h-[52vh] md:min-h-[58vh]"
          />
        </div>
      </section>

      <section className="px-6 pb-16 pt-4 text-center sm:px-10 sm:pb-20 md:px-16">
        <ul className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center sm:gap-8">
          {option.points.map((point) => (
            <li
              key={point}
              className="text-sm font-medium text-neutral-600 sm:text-[15px]"
            >
              {point}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
