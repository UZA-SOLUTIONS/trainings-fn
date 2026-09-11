import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import { cn } from "@/lib/utils";

/**
 * Large viewport modal — content keeps its natural width/size;
 * the shell scrolls instead of shrinking the table.
 */
export function TrackResultModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-stretch justify-center p-2 sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Track result"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-[1] flex h-full w-full max-w-[min(100%,92rem)] flex-col overflow-hidden rounded-2xl",
          "border-2 border-primary/40 bg-background shadow-2xl",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm transition-colors hover:text-foreground sm:right-4 sm:top-4"
          aria-label="Close track result"
        >
          <FiX className="size-6" strokeWidth={2} aria-hidden />
        </button>

        <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-3 sm:p-5 md:p-6">
          <div className="min-w-0 w-full">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
