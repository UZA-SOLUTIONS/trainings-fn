import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiUsers,
  FiSettings,
  FiBriefcase,
  FiHome,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Instructor", icon: FiUsers, adminOnly: false },
  { to: "/manage", label: "Management", icon: FiSettings, adminOnly: true },
  { to: "/institutions", label: "Banks", icon: FiBriefcase, adminOnly: false },
] as const;

export function StaffNav() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await logout();
    navigate("/auth", { replace: true });
  }

  const links = NAV.filter((item) => !item.adminOnly || isAdmin);

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  const navBody = (
    <>
      <div className="flex items-center justify-between gap-3 px-5 py-5">
        <Link to="/" className="inline-flex items-center" aria-label="UZA Mobility home">
          <img src="/logo.avif" alt="UZA Mobility" className="h-9 w-auto object-contain" />
        </Link>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        >
          <FiX size={18} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p className="mb-2 px-3 text-eyebrow text-muted-foreground">Workspace</p>
        {links.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={18} aria-hidden />
              {label}
            </Link>
          );
        })}
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <FiHome size={18} aria-hidden />
          Public site
        </Link>
      </nav>

      <div className="mt-auto border-t border-border/70 px-4 py-4">
        <p className="truncate text-sm font-medium text-foreground">
          {user?.full_name || user?.email || "Staff"}
        </p>
        {user?.role && (
          <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
            {user.role}
          </p>
        )}
        <Button
          variant="outline"
          className="mt-3 w-full shadow-none"
          onClick={signOut}
        >
          <FiLogOut aria-hidden />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <>
      <div className="flex items-center justify-between border-b border-border/70 bg-background px-4 py-3 lg:hidden">
        <Link to="/" aria-label="UZA Mobility home">
          <img src="/logo.avif" alt="UZA Mobility" className="h-8 w-auto object-contain" />
        </Link>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <FiMenu size={18} />
        </button>
      </div>

      {open && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/70 bg-background transition-transform duration-200 lg:static lg:z-0 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {navBody}
      </aside>
    </>
  );
}
