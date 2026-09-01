import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CandidateTrackResult,
  CandidateTrackSearch,
  friendlyTrackError,
} from "@/components/home/CandidateTracker";
import { trackCandidate, type CandidateTrackView } from "@/services/candidateService";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";

export default function Track() {
  const [params, setParams] = useSearchParams();
  const candidateId = params.get("id")?.trim().toUpperCase() ?? "";
  const [track, setTrack] = useState<CandidateTrackView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!candidateId) {
      setTrack(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    trackCandidate(candidateId)
      .then((data) => {
        if (!cancelled) {
          setTrack(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setTrack(null);
          setError(friendlyTrackError(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  function handleSearch(code: string) {
    setParams({ id: code.trim().toUpperCase() });
  }

  function clearSearch() {
    setParams({});
    setTrack(null);
    setError(null);
  }

  return (
    <main className="min-h-[60vh]">
      <section className="relative flex min-h-[min(42svh,22rem)] items-center overflow-hidden border-b border-border/50 py-12 text-ink-foreground sm:min-h-[min(46svh,26rem)] md:py-16 lg:min-h-[38vh]">
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

        <div className="relative container-page w-full">
          {track ? (
            <div className="flex max-w-2xl flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-eyebrow text-volt">Track your application</p>
                <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                  {track.full_name}
                </h1>
                <p className="mt-1 font-display text-lg font-semibold text-volt sm:text-xl">
                  {track.candidate_code}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="border-white/35 bg-transparent text-ink-foreground shadow-none hover:bg-white/10"
                onClick={clearSearch}
              >
                Search another ID
              </Button>
            </div>
          ) : (
            <CandidateTrackSearch
              variant="page"
              defaultCode={candidateId}
              onSubmitCode={handleSearch}
            />
          )}
        </div>
      </section>

      <section className="container-page section-y">
        {loading && (
          <div className="flex min-h-[16rem] items-center justify-center">
            <LoadingSpinner label="Loading your application…" />
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-xl rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-medium text-destructive">{error}</p>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={clearSearch}>
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && track && <CandidateTrackResult track={track} />}

        {!loading && !error && !track && !candidateId && (
          <p className="text-center text-sm text-muted-foreground">
            Enter your candidate ID above to see training, documents, financing, and approvals.
          </p>
        )}
      </section>
    </main>
  );
}
