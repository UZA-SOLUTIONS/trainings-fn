import { Link } from "react-router-dom";
import { FiMenu, FiX, FiArrowUpRight } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#programme", label: "Programme" },
  { href: "/#calculator", label: "Financing" },
  { href: "/#offers", label: "Buy options" },
  { to: "/apply", label: "Apply" },
  { to: "/auth", label: "Staff", secondary: true },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
      <div className="relative z-50 container-page flex h-14 items-center justify-between bg-background sm:h-16 md:h-[4.25rem]">
        <Link to="/" className="inline-flex min-h-11 items-center" aria-label="UZA Mobility home">
          <img
            src="/logo.avif"
            alt="UZA Mobility"
            className="h-8 w-auto object-contain sm:h-9 md:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-base text-muted-foreground lg:flex">
          {links.map((l) =>
            l.to ? (
              <Link
                key={l.label}
                to={l.to}
                className="font-normal transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href}
                className="font-normal transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button size="default" asChild className="hidden shadow-none md:inline-flex">
            <Link to="/apply">Apply for training</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:text-primary lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <FiX size={24} strokeWidth={1.75} /> : <FiMenu size={24} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* Dim backdrop — tap to close */}
      <button
        type="button"
        aria-label="Close menu"
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      {/* Half-height panel */}
      <div
        className={cn(
          "absolute inset-x-0 top-full z-50 max-h-[50dvh] overflow-y-auto border-b border-border bg-background shadow-none transition-[opacity,transform] duration-200 lg:hidden",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0 pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <nav className="container-page flex flex-col py-4 pb-5">
          <ul className="flex flex-col border-t border-border/60">
            {links.map((l) => {
              const primary = links.filter((x) => !x.secondary);
              const index = l.secondary
                ? null
                : String(primary.indexOf(l) + 1).padStart(2, "0");
              const className = cn(
                "group flex items-center justify-between gap-4 border-b border-border/60 transition-colors active:bg-muted/50",
                l.secondary
                  ? "min-h-11 border-b-0 py-2.5 text-muted-foreground"
                  : "min-h-12 py-2.5",
              );
              const label = (
                <>
                  <span className="flex items-baseline gap-3">
                    {index && (
                      <span className="font-display text-[11px] font-medium tracking-wide text-muted-foreground/55">
                        {index}
                      </span>
                    )}
                    <span
                      className={cn(
                        "font-display tracking-tight transition-colors group-active:text-primary",
                        l.secondary ? "text-sm font-medium" : "text-lg font-semibold",
                      )}
                    >
                      {l.label}
                    </span>
                  </span>
                  {!l.secondary && (
                    <FiArrowUpRight
                      className="size-4 shrink-0 text-muted-foreground/40 transition-colors group-active:text-primary"
                      aria-hidden
                    />
                  )}
                </>
              );

              return (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} onClick={() => setOpen(false)} className={className}>
                      {label}
                    </Link>
                  ) : (
                    <a href={l.href} onClick={() => setOpen(false)} className={className}>
                      {label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>

          <Button size="default" asChild className="mt-4 w-full shadow-none">
            <Link to="/apply" onClick={() => setOpen(false)}>
              Apply for training
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
