import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export function StaffNav() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await logout();
    navigate("/auth", { replace: true });
  }

  const link = (path: string) =>
    cn(
      "transition-colors hover:text-foreground",
      location.pathname === path || location.pathname.startsWith(path + "/")
        ? "font-medium text-foreground"
        : "text-muted-foreground",
    );

  return (
    <header className="border-b border-border/60 bg-background">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <Link to="/" className="inline-flex items-center" aria-label="UZA Mobility home">
            <img
              src="/logo.avif"
              alt="UZA Mobility"
              className="h-9 w-auto object-contain md:h-11"
            />
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-base">
            <Link to="/dashboard" className={link("/dashboard")}>
              Instructor
            </Link>
            {isAdmin && (
              <Link to="/manage" className={link("/manage")}>
                Management
              </Link>
            )}
            <Link to="/institutions" className={link("/institutions")}>
              Banks
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {user?.role && (
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {user.role}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={signOut}>
            <FiLogOut aria-hidden />
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
