import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const TICK_COUNT = 36;
const HIDE_MS = 900;

/**
 * Camera-lens / ChatGPT-style scroll meter: equal horizontal ticks.
 * Current viewport ticks are bold; others stay lighter. Shows while scrolling.
 */
export function ScrollLensIndicator() {
  const { pathname } = useLocation();
  const [progress, setProgress] = useState(0);
  const [viewportRatio, setViewportRatio] = useState(0.2);
  const [visible, setVisible] = useState(false);
  const [needed, setNeeded] = useState(false);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    function measure() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setNeeded(scrollable > 80);
      setViewportRatio(
        Math.min(1, window.innerHeight / Math.max(document.documentElement.scrollHeight, 1)),
      );
      setProgress(scrollable <= 0 ? 0 : window.scrollY / scrollable);
    }

    function onScroll() {
      measure();
      setVisible(true);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), HIDE_MS);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [pathname]);

  const activeStart = progress * (1 - viewportRatio);
  const activeEnd = activeStart + viewportRatio;

  const ticks = useMemo(() => Array.from({ length: TICK_COUNT }, (_, i) => i), []);

  if (!needed) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed right-2 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-end justify-center gap-1.5 transition-opacity duration-300 sm:right-3 sm:flex sm:gap-2 md:right-4",
        visible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      {ticks.map((i) => {
        const t = (i + 0.5) / TICK_COUNT;
        const active = t >= activeStart && t <= activeEnd;

        return (
          <span
            key={i}
            className={cn(
              "block w-5 rounded-full transition-[height,background-color,opacity] duration-150 sm:w-6",
              active
                ? "h-[3px] bg-foreground opacity-100 sm:h-1"
                : "h-0.5 bg-foreground/30 opacity-80",
            )}
          />
        );
      })}
    </div>
  );
}
