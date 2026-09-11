import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollLensIndicator } from "@/components/layout/ScrollLensIndicator";

/** Full-bleed heroes sit under the transparent navbar — no spacer. */
const OVERLAY_PATHS = new Set([
  "/",
  "/track",
  "/requirements",
]);

export function MainLayout() {
  const { pathname } = useLocation();
  const overlayHero = OVERLAY_PATHS.has(pathname);
  const isTrack = pathname === "/track";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {!overlayHero && (
        <div className="h-14 sm:h-16 md:h-[4.25rem]" aria-hidden />
      )}
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
      <Footer />
      {!isTrack && <ScrollLensIndicator />}
    </div>
  );
}
