import { Link, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiHelpCircle, FiSearch } from "react-icons/fi";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { to: "/about", label: "About Us" },
  { to: "/financing", label: "Financing" },
  { to: "/requirements", label: "Requirements" },
  { to: "/track", label: "Track" },
  { to: "/apply", label: "Apply" },
] as const;

/** Pages whose first viewport is a full-bleed hero under a transparent nav. */
const HERO_OVERLAY_PATHS = new Set([
  "/",
  "/track",
  "/requirements",
  "/financing",
  "/about",
]);

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const overlay =
    !scrolled && !open && HERO_OVERLAY_PATHS.has(location.pathname);
  /** Tesla-style: light chrome on bright heroes; we keep light text on cinematic dark photos. */
  const lightChrome = overlay;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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

  function isActive(to: string) {
    if (to.startsWith("/#")) {
      return location.pathname === "/" && location.hash === to.slice(1);
    }
    return location.pathname === to;
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow] duration-300",
        lightChrome
          ? "bg-transparent shadow-none"
          : "bg-background/90 shadow-none backdrop-blur-md",
      )}
    >
      <div className="relative mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="relative z-10 inline-flex shrink-0 items-center"
          aria-label="UZA Mobility home"
          onClick={() => setOpen(false)}
        >
          <img
            src={lightChrome ? "/white.avif" : "/logo.avif"}
            alt="UZA Mobility"
            className="h-7 w-auto object-contain sm:h-8"
          />
        </Link>

        <nav
          className={cn(
            "absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 text-[15px] font-medium tracking-wide lg:flex xl:gap-8",
            lightChrome ? "text-white" : "text-foreground",
          )}
          aria-label="Primary"
        >
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={cn(
                "whitespace-nowrap transition-opacity hover:opacity-70",
                isActive(l.to) && "opacity-100",
                !isActive(l.to) && "opacity-90",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-1 sm:gap-1.5">
          <Link
            to="/requirements"
            aria-label="Help"
            className={cn(
              "hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex",
              lightChrome
                ? "text-white hover:bg-white/15"
                : "text-foreground hover:bg-muted",
            )}
          >
            <FiHelpCircle className="size-[22px]" strokeWidth={1.6} />
          </Link>
          <Link
            to="/track"
            aria-label="Track ID"
            className={cn(
              "hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex",
              lightChrome
                ? "text-white hover:bg-white/15"
                : "text-foreground hover:bg-muted",
            )}
          >
            <FiSearch className="size-[22px]" strokeWidth={1.6} />
          </Link>
          <button
            type="button"
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden",
              lightChrome
                ? "text-white hover:bg-white/15"
                : "text-foreground hover:bg-muted",
            )}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <FiX size={22} strokeWidth={1.6} /> : <FiMenu size={22} strokeWidth={1.6} />}
          </button>
        </div>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        id="mobile-nav"
        className={cn(
          "absolute inset-x-0 top-full z-50 border-b border-border/60 bg-background transition-[opacity,transform] duration-200 lg:hidden",
          open
            ? "visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-2 opacity-0",
        )}
        aria-hidden={!open}
      >
        <nav className="flex flex-col px-4 py-4 sm:px-6">
          {links.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => setOpen(false)}
              className="border-b border-border/50 py-3.5 text-lg font-medium text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            className="py-3.5 text-lg font-medium text-foreground"
          >
            Staff login
          </Link>
        </nav>
      </div>
    </header>
  );
}
