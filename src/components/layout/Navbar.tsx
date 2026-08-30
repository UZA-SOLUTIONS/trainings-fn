import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#programme", label: "Programme" },
  { href: "/#calculator", label: "Financing" },
  { href: "/#offers", label: "Buy options" },
  { to: "/apply", label: "Apply" },
  { to: "/auth", label: "Staff" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="container-page flex items-center justify-between py-4 md:py-5">
        <Link to="/" className="inline-flex items-center" aria-label="UZA Mobility home">
          <img
            src="/logo.avif"
            alt="UZA Mobility"
            className="h-9 w-auto object-contain md:h-11"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-base text-muted-foreground md:flex">
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
          <Button size="default" asChild className="hidden sm:inline-flex">
            <Link to="/apply">Apply for training</Link>
          </Button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border/60 md:hidden">
          <ul className="container-page flex flex-col gap-1 py-3 text-base">
            {links.map((l) => (
              <li key={l.label}>
                {l.to ? (
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-1 py-2.5"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-1 py-2.5"
                  >
                    {l.label}
                  </a>
                )}
              </li>
            ))}
            <li className="pt-2">
              <Button size="default" asChild className="w-full shadow-none">
                <Link to="/apply" onClick={() => setOpen(false)}>
                  Apply for training
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
