import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

/** Dark full-bleed heroes sit under the transparent navbar — no spacer. */
const OVERLAY_PATHS = new Set([
  "/",
  "/track",
  "/requirements",
]);

export function MainLayout() {
  const { pathname } = useLocation();
  const overlayHero = OVERLAY_PATHS.has(pathname);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {!overlayHero && (
        <div className="h-14 sm:h-16 md:h-[4.25rem]" aria-hidden />
      )}
      <Outlet />
      <Footer />
    </div>
  );
}
