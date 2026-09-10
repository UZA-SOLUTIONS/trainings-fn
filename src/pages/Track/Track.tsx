import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import {
  CandidateTrackResult,
  CandidateTrackSearch,
  friendlyTrackError,
} from "@/components/home/CandidateTracker";
import { BankTrackResult } from "@/components/home/BankTrackResult";
import {
  trackLookup,
  type BankTrackView,
  type CandidateTrackView,
} from "@/services/candidateService";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NID_STORAGE_PREFIX = "uza-track-nid:";

export default function Track() {
  const [params, setParams] = useSearchParams();
  const lookupId = params.get("id")?.trim().toUpperCase() ?? "";
  const [track, setTrack] = useState<CandidateTrackView | null>(null);
  const [bank, setBank] = useState<BankTrackView | null>(null);
  const [needsNationalId, setNeedsNationalId] = useState(false);
  const [nationalId, setNationalId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [candidateFilter, setCandidateFilter] = useState("");

  useEffect(() => {
    if (!lookupId) {
      setTrack(null);
      setBank(null);
      setNeedsNationalId(false);
      setNationalId("");
      setError(null);
      setConfirmError(null);
      setLoading(false);
      setCandidateFilter("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setConfirmError(null);
    setCandidateFilter("");
    setNeedsNationalId(false);
    setTrack(null);
    setBank(null);

    const storageKey = `${NID_STORAGE_PREFIX}${lookupId}`;
    const storedNid = sessionStorage.getItem(storageKey) ?? "";
    if (storedNid) {
      sessionStorage.removeItem(storageKey);
      setNationalId(storedNid);
    }

    trackLookup(lookupId, storedNid ? { nationalId: storedNid } : undefined)
      .then((result) => {
        if (cancelled) return;
        if (result.type === "bank") {
          setBank(result.bank);
          setTrack(null);
          setNeedsNationalId(false);
        } else if (result.type === "candidate_challenge") {
          setNeedsNationalId(true);
          setTrack(null);
          setBank(null);
        } else {
          setTrack(result.track);
          setBank(null);
          setNeedsNationalId(false);
        }
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setTrack(null);
          setBank(null);
          setNeedsNationalId(false);
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

  function handleLookup({ code, nationalId: nid }: { code: string; nationalId?: string }) {
    const next = code.trim().toUpperCase();
    if (nid?.trim()) {
      sessionStorage.setItem(`${NID_STORAGE_PREFIX}${next}`, nid.trim());
    }
    setNationalId(nid?.trim() ?? "");
    setParams({ id: next });
  }

  async function handleConfirmNationalId(e: FormEvent) {
    e.preventDefault();
    const trimmed = nationalId.trim();
    if (!trimmed) {
      setConfirmError("Enter your national ID to confirm.");
      return;
    }
    setConfirming(true);
    setConfirmError(null);
    try {
      const result = await trackLookup(lookupId, { nationalId: trimmed });
      if (result.type === "candidate") {
        setTrack(result.track);
        setNeedsNationalId(false);
        setBank(null);
        setError(null);
      } else if (result.type === "candidate_challenge") {
        setConfirmError("Confirm with your national ID to view this application.");
      } else {
        setConfirmError("Unexpected response. Try again.");
      }
    } catch (err) {
      setConfirmError(friendlyTrackError(err));
    } finally {
      setConfirming(false);
    }
  }

  function clearSearch() {
    setParams({});
    setTrack(null);
    setBank(null);
    setNeedsNationalId(false);
    setNationalId("");
    setError(null);
    setConfirmError(null);
    setCandidateFilter("");
  }

  return (
    <main className="min-h-[60vh]">
      <section className="relative flex min-h-[80vh] items-center overflow-hidden border-b border-border/50 py-16 text-ink-foreground sm:py-20 md:py-24">
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
          <CandidateTrackSearch
            variant="page"
            defaultCode={lookupId}
            defaultNationalId={nationalId}
            onSubmitLookup={handleLookup}
          />
        </div>
      </section>

      <section className="container-page section-y">
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

        {!loading && !error && needsNationalId && (
          <div className="mx-auto max-w-md rounded-[1.75rem] border border-border/70 bg-background p-6 sm:rounded-[2rem] sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FiLock className="size-5" strokeWidth={1.75} aria-hidden />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold tracking-tight sm:text-2xl">
              Confirm it&apos;s you
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We found <span className="font-mono font-medium text-foreground">{lookupId}</span>.
              Enter the national ID from the application to open the record.
            </p>
            <form onSubmit={handleConfirmNationalId} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="track-national-id"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  National ID
                </label>
                <Input
                  id="track-national-id"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="As on the national ID"
                  autoComplete="off"
                  spellCheck={false}
                  className="font-display tracking-wide"
                  autoFocus
                />
              </div>
              {confirmError && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {confirmError}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={confirming} className="shadow-none">
                  {confirming ? "Checking…" : "Confirm and view"}
                </Button>
                <Button type="button" variant="outline" onClick={clearSearch} className="shadow-none">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {!loading && !error && !needsNationalId && track && <CandidateTrackResult track={track} />}
        {!loading && !error && !needsNationalId && bank && (
          <BankTrackResult
            bank={bank}
            filterQuery={candidateFilter}
            onFilterQueryChange={setCandidateFilter}
          />
        )}

        {!loading && !error && !track && !bank && !needsNationalId && !lookupId && (
          <p className="text-center text-sm text-muted-foreground">
            Enter a bank ID to open a portfolio, or a candidate ID plus national ID to view details.
          </p>
        )}
      </section>
    </main>
  );
}
