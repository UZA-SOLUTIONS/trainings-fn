import { useNavigate } from "react-router-dom";
import { CandidateTrackSearch } from "@/components/home/CandidateTracker";
import { HOME_HERO } from "@/content/marketing";

export function HomeHero() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-[68vh] flex-col overflow-hidden">
      <img
        src={HOME_HERO.src}
        alt={HOME_HERO.alt}
        width={1600}
        height={1104}
        className="absolute inset-0 h-full w-full object-cover object-[72%_center] sm:object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.14_0.035_158_/0.55)_0%,oklch(0.14_0.035_158_/0.78)_45%,oklch(0.14_0.035_158_/0.94)_100%)] md:bg-gradient-to-r md:from-[oklch(0.16_0.04_158)]/94 md:via-[oklch(0.18_0.04_158)]/82 md:to-[oklch(0.2_0.03_158)]/50" />

      <div className="relative container-page flex min-h-[68vh] flex-1 flex-col justify-center py-16 text-ink-foreground sm:py-20 md:py-24">
        <div className="min-w-0 max-w-3xl">
          <h1 className="font-display text-[2.25rem] font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-[4rem]">
            {HOME_HERO.title}
          </h1>
          <div className="mt-8 max-w-xl sm:mt-10">
            <CandidateTrackSearch
              variant="hero"
              onSubmitLookup={({ code, nationalId }) => {
                const next = code.trim().toUpperCase();
                if (nationalId?.trim()) {
                  sessionStorage.setItem(`uza-track-nid:${next}`, nationalId.trim());
                }
                navigate(`/track?id=${encodeURIComponent(next)}`);
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
