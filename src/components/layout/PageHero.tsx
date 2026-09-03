import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Cta =
  | { label: string; to: string }
  | { label: string; href: string };

export function PageHero({
  title,
  description,
  primary,
  secondary,
  compact,
  className,
}: {
  title: string;
  description?: string;
  primary?: Cta;
  secondary?: Cta;
  compact?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative flex overflow-hidden border-b border-border/50 text-ink-foreground",
        compact ? "min-h-[min(42vh,20rem)]" : "min-h-[min(48vh,24rem)]",
        className,
      )}
    >
      <img
        src="/bg.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[oklch(0.16_0.04_158)]/88 md:bg-[oklch(0.16_0.04_158)]/84" />
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 15% 0%, oklch(0.7 0.18 128 / 0.18), transparent 55%),
            radial-gradient(ellipse 50% 40% at 90% 100%, oklch(0.35 0.08 158 / 0.35), transparent 50%)
          `,
        }}
      />

      <div className="relative container-page flex w-full flex-1 flex-col items-start justify-center py-16 sm:py-20 md:py-24">
        <h1 className="max-w-2xl text-left font-display text-3xl font-bold tracking-tight sm:max-w-3xl sm:text-4xl md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-foreground/75 sm:text-lg">
            {description}
          </p>
        )}
        {(primary || secondary) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {primary && (
              <Button asChild className="bg-volt text-volt-foreground shadow-none hover:bg-volt/90">
                {"to" in primary ? (
                  <Link to={primary.to}>{primary.label}</Link>
                ) : (
                  <a href={primary.href}>{primary.label}</a>
                )}
              </Button>
            )}
            {secondary && (
              <Button
                asChild
                variant="outline"
                className="border-white/35 bg-transparent text-ink-foreground shadow-none hover:bg-white/10"
              >
                {"to" in secondary ? (
                  <Link to={secondary.to}>{secondary.label}</Link>
                ) : (
                  <a href={secondary.href}>{secondary.label}</a>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
