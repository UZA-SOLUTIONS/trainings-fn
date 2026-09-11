import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CandidateTrackResult,
  CandidateTrackSearch,
  friendlyTrackError,
} from "@/components/home/CandidateTracker";
import { BankTrackResult } from "@/components/home/BankTrackResult";
import { TrackResultModal } from "@/components/home/TrackResultModal";
import {
  trackLookup,
  type BankTrackView,
  type CandidateTrackView,
} from "@/services/candidateService";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";

export default function Track() {
  const [params, setParams] = useSearchParams();
  const lookupId = params.get("id")?.trim().toUpperCase() ?? "";
  const [track, setTrack] = useState<CandidateTrackView | null>(null);
  const [bank, setBank] = useState<BankTrackView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [candidateFilter, setCandidateFilter] = useState("");

  useEffect(() => {
    if (!lookupId) {
      setTrack(null);
      setBank(null);
      setError(null);
      setLoading(false);
      setCandidateFilter("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setCandidateFilter("");
    setTrack(null);
    setBank(null);

    trackLookup(lookupId)
      .then((result) => {
        if (cancelled) return;
        if (result.type === "bank") {
          setBank(result.bank);
          setTrack(null);
        } else {
          setTrack(result.track);
          setBank(null);
        }
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setTrack(null);
          setBank(null);
          setError(friendlyTrackError(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lookupId]);

  function handleLookup({ code }: { code: string }) {
    setParams({ id: code.trim().toUpperCase() });
  }

  function clearSearch() {
    setParams({});
    setTrack(null);
    setBank(null);
    setError(null);
    setCandidateFilter("");
  }

  const modalOpen = Boolean(lookupId) && (loading || Boolean(error) || Boolean(track) || Boolean(bank));

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <section className="relative flex min-h-[100dvh] flex-1 items-center overflow-hidden text-ink-foreground">
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

        <div className="relative container-page flex w-full justify-center py-24 sm:py-28">
          <CandidateTrackSearch
            variant="page"
            defaultCode={lookupId}
            onSubmitLookup={handleLookup}
          />
        </div>
      </section>

      <TrackResultModal open={modalOpen} onClose={clearSearch}>
        {loading && (
          <div className="flex min-h-[16rem] items-center justify-center">
            <LoadingSpinner label="Loading…" />
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
        {!loading && !error && bank && (
          <BankTrackResult
            bank={bank}
            filterQuery={candidateFilter}
            onFilterQueryChange={setCandidateFilter}
          />
        )}
      </TrackResultModal>
    </main>
  );
}
