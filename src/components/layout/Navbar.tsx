import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiArrowUpRight, FiChevronDown } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { NavMegaMenu } from "@/components/layout/NavMegaMenu";
import {
  NAV_MEGA_MENUS,
  type NavMegaId,
} from "@/content/navMegaMenus";
import { cn } from "@/lib/utils";

const MEGA_BY_PATH: Record<string, NavMegaId> = {};

const links = [
  { to: "/#path", label: "Programme", mega: "programme" as const },
  { to: "/apply", label: "Training", mega: "training" as const },
  { to: "/track", label: "Track ID" },
  { to: "/#financing", label: "Financing", mega: "financing" as const },
  { to: "/requirements", label: "Requirements" },
] as const;

/** Pages whose first viewport is a dark full-bleed hero — light nav chrome until scroll. */
const DARK_HERO_PATHS = new Set([
  "/",
  "/track",
  "/requirements",
]);

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<NavMegaId | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const megaCloseTimer = useRef<number | null>(null);
  const location = useLocation();

  /** Transparent chrome only on dark heroes at top; mobile drawer forces solid. Mega menus do not. */
  const transparent =
    !scrolled && !open && DARK_HERO_PATHS.has(location.pathname);
  const onDarkHero = transparent;

  function clearMegaCloseTimer() {
    if (megaCloseTimer.current != null) {
      window.clearTimeout(megaCloseTimer.current);
      megaCloseTimer.current = null;
    }
  }

  function openMega(id: NavMegaId) {
    clearMegaCloseTimer();
    setOpen(false);
    setMegaOpen(id);
  }

  function scheduleCloseMega() {
    clearMegaCloseTimer();
    megaCloseTimer.current = window.setTimeout(() => {
      setMegaOpen(null);
      megaCloseTimer.current = null;
    }, 140);
  }

  function closeMega() {
    clearMegaCloseTimer();
    setMegaOpen(null);
  }

  function toggleMega(id: NavMegaId) {
    clearMegaCloseTimer();
    setOpen(false);
    setMegaOpen((current) => (current === id ? null : id));
  }

  useEffect(() => {
    setOpen(false);
    closeMega();
  }, [location.pathname, location.hash, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => () => clearMegaCloseTimer(), []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        transparent
          ? "border-b border-transparent bg-transparent shadow-none"
          : "border-b border-border/70 bg-background/95 shadow-sm backdrop-blur-md",
        megaOpen && "z-[60]",
      )}
    >
      <div className="container-page relative z-50 flex h-14 items-center justify-between gap-3 sm:h-16 md:h-[4.25rem]">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center"
          aria-label="UZA Mobility home"
          onClick={() => {
            setOpen(false);
            closeMega();
          }}
        >
          <img
            src={onDarkHero ? "/white.avif" : "/logo.avif"}
            alt="UZA Mobility"
            className="h-8 w-auto object-contain sm:h-9 md:h-10"
          />
        </Link>

        <nav
          className={cn(
            "absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 text-lg xl:flex xl:gap-11",
            onDarkHero ? "text-ink-foreground/75" : "text-muted-foreground",
          )}
        >
          {links.map((l) => {
            const megaId = "mega" in l ? l.mega : undefined;
            const isMegaActive = megaId != null && megaOpen === megaId;
            const isPathActive =
              location.pathname === l.to || MEGA_BY_PATH[location.pathname] === megaId;

            if (megaId) {
              return (
                <button
                  key={l.label}
                  type="button"
                  onMouseEnter={() => openMega(megaId)}
                  onMouseLeave={scheduleCloseMega}
                  onFocus={() => openMega(megaId)}
                  onClick={() => toggleMega(megaId)}
                  aria-haspopup="dialog"
                  aria-expanded={isMegaActive}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap font-medium transition-colors",
                    onDarkHero ? "hover:text-ink-foreground" : "hover:text-foreground",
                    (isPathActive || isMegaActive) &&
                      (onDarkHero
                        ? "font-semibold text-ink-foreground"
                        : "font-semibold text-foreground"),
                  )}
                >
                  {l.label}
                  <FiChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      isMegaActive && "rotate-180",
                    )}
                    aria-hidden
                  />
                </button>
              );
            }

            return (
              <Link
                key={l.label}
                to={l.to}
                onClick={closeMega}
                className={cn(
                  "whitespace-nowrap font-medium transition-colors",
                  onDarkHero ? "hover:text-ink-foreground" : "hover:text-foreground",
                  location.pathname === l.to &&
                    (onDarkHero
                      ? "font-semibold text-ink-foreground"
                      : "font-semibold text-foreground"),
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="default"
            asChild
            className={cn(
              "hidden shadow-none lg:inline-flex",
              onDarkHero &&
                "border border-white/35 bg-volt text-volt-foreground hover:bg-volt/90",
            )}
          >
            <Link to="/apply" onClick={closeMega}>
              Apply for training
            </Link>
          </Button>
          <button
            type="button"
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-xl transition-colors xl:hidden",
              onDarkHero
                ? "text-ink-foreground hover:bg-white/10"
                : "text-foreground hover:bg-muted hover:text-primary",
            )}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => {
              closeMega();
              setOpen((v) => !v);
            }}
          >
            {open ? <FiX size={22} strokeWidth={1.75} /> : <FiMenu size={22} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-ink/40 xl:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        id="mobile-nav"
        className={cn(
          "absolute inset-x-0 top-full z-50 max-h-[min(70dvh,28rem)] overflow-y-auto border-b border-border bg-background shadow-lg transition-[opacity,transform] duration-200 xl:hidden",
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0",
        )}
        aria-hidden={!open}
      >
        <nav className="container-page flex flex-col py-3 pb-5">
          <ul className="flex flex-col border-t border-border/60">
            {links.map((l, i) => {
              const index = String(i + 1).padStart(2, "0");
              const megaId = "mega" in l ? l.mega : undefined;
              const rowClass =
                "group flex min-h-14 w-full items-center justify-between gap-4 border-b border-border/60 py-3 text-left transition-colors active:bg-muted/50";
              const label = (
                <>
                  <span className="flex items-baseline gap-3">
                    <span className="font-display text-xs font-medium tracking-wide text-muted-foreground/55">
                      {index}
                    </span>
                    <span className="font-display text-xl font-semibold tracking-tight transition-colors group-active:text-primary sm:text-2xl">
                      {l.label}
                    </span>
                  </span>
                  {megaId ? (
                    <FiChevronDown
                      className="size-5 shrink-0 text-muted-foreground/40"
                      aria-hidden
                    />
                  ) : (
                    <FiArrowUpRight
                      className="size-5 shrink-0 text-muted-foreground/40 transition-colors group-active:text-primary"
                      aria-hidden
                    />
                  )}
                </>
              );

              return (
                <li key={l.label}>
                  {megaId ? (
                    <button type="button" onClick={() => toggleMega(megaId)} className={rowClass}>
                      {label}
                    </button>
                  ) : (
                    <Link to={l.to} onClick={() => setOpen(false)} className={rowClass}>
                      {label}
                    </Link>
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

      {NAV_MEGA_MENUS.map((config) => (
        <NavMegaMenu
          key={config.id}
          config={config}
          open={megaOpen === config.id}
          onClose={closeMega}
          onKeepOpen={() => openMega(config.id)}
          variant="float"
        />
      ))}
    </header>
  );
}
