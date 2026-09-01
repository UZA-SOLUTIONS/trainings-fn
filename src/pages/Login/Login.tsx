import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { loadDashboardPreferences } from "@/components/dashboard/preferences";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, login, register } = useAuth();
  const fromState = (location.state as { from?: string } | null)?.from;
  const defaultDashboard = `/dashboard?tab=${loadDashboardPreferences().defaultTab}`;
  const redirectTo = fromState ?? defaultDashboard;
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate(redirectTo, { replace: true });
  }, [user, loading, navigate, redirectTo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await register(fullName, email, password);
      } else {
        await login(email, password);
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/70 p-8">
      <p className="text-eyebrow text-muted-foreground">UZA Mobility staff</p>
      <h1 className="mt-2 font-display text-2xl font-bold">
        {mode === "signin" ? "Instructor sign in" : "Create a staff account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signin"
          ? "Manage Tunga Taxi cohorts, candidates and the waiting list."
          : "Only the first account becomes programme admin. Other staff are created by an admin."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              maxLength={100}
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <button
        type="button"
        className="mt-5 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin"
          ? "First-time setup? Create the admin account"
          : "Already have an account? Sign in"}
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Link to="/" className="underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </Card>
  );
}
