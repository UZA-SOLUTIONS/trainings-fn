import { Link } from "react-router-dom";
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiLinkedin,
  FiInstagram,
  FiFacebook,
  FiYoutube,
} from "react-icons/fi";
import { FaXTwitter } from "react-icons/fa6";

const PROGRAMME = [
  { href: "/#programme", label: "How it works" },
  { href: "/#calculator", label: "Financing" },
  { href: "/#offers", label: "Buy options" },
  { href: "/#partners", label: "Partners" },
];

const DRIVERS = [
  { to: "/apply", label: "Apply for training" },
  { to: "/requirements", label: "Requirements" },
  { to: "/auth", label: "Staff login" },
];

const SOCIAL = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/uza-mobility",
    icon: FiLinkedin,
  },
  {
    label: "X",
    href: "https://x.com/uzamobility",
    icon: FaXTwitter,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/uzamobility",
    icon: FiInstagram,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/uzamobility",
    icon: FiFacebook,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@uzamobility",
    icon: FiYoutube,
  },
];

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-ink-foreground">
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center" aria-label="UZA Mobility home">
              <img
                src="/white.avif"
                alt="UZA Mobility"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-foreground/65">
              Electric mobility ownership for Rwanda&apos;s professional drivers.
            </p>
            <ul className="mt-6 flex items-center gap-2">
              {SOCIAL.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ink-foreground/70 transition-colors hover:border-volt/50 hover:bg-white/5 hover:text-volt"
                  >
                    <Icon size={16} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-8 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-3">
            <nav aria-labelledby="footer-programme">
              <h2
                id="footer-programme"
                className="text-eyebrow text-ink-foreground/45"
              >
                Programme
              </h2>
              <ul className="mt-4 space-y-2.5">
                {PROGRAMME.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-ink-foreground/75 transition-colors hover:text-volt"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-labelledby="footer-drivers">
              <h2 id="footer-drivers" className="text-eyebrow text-ink-foreground/45">
                Drivers
              </h2>
              <ul className="mt-4 space-y-2.5">
                {DRIVERS.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-ink-foreground/75 transition-colors hover:text-volt"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="text-eyebrow text-ink-foreground/45">Contact</h2>
              <ul className="mt-4 space-y-3 text-sm text-ink-foreground/75">
                <li>
                  <a
                    href="mailto:hello@uzamobility.rw"
                    className="inline-flex items-start gap-2.5 transition-colors hover:text-volt"
                  >
                    <FiMail className="mt-0.5 shrink-0 opacity-60" size={15} aria-hidden />
                    hello@uzamobility.rw
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+250788000000"
                    className="inline-flex items-start gap-2.5 transition-colors hover:text-volt"
                  >
                    <FiPhone className="mt-0.5 shrink-0 opacity-60" size={15} aria-hidden />
                    +250 788 000 000
                  </a>
                </li>
                <li className="inline-flex items-start gap-2.5">
                  <FiMapPin className="mt-0.5 shrink-0 opacity-60" size={15} aria-hidden />
                  <span>
                    Kigali, Rwanda
                    <span className="mt-0.5 block text-ink-foreground/50">
                      KN Ave · Nyarugenge
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-5 text-center text-xs text-ink-foreground/50">
          <p>© {year} UZA Mobility. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
