import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as authService from "@/services/authService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { roleLabel } from "@/lib/permissions";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-RW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function ProfilePanel() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFullName(user?.full_name ?? "");
    setEmail(user?.email ?? "");
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    setBusy(true);
    try {
      await authService.updateProfile(fullName.trim(), email.trim());
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile");
    } finally {
      setBusy(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <p className="text-eyebrow text-muted-foreground">Account</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Profile</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card className="border-border/70 p-6">
          <p className="text-eyebrow text-muted-foreground">Your account</p>
          <div className="mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-display text-2xl font-bold text-primary">
            {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold">
            {user.full_name || "Staff member"}
          </h2>
          <p className="mt-1 text-base text-muted-foreground">{user.email}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{roleLabel(user.role)}</Badge>
          </div>
          <dl className="mt-6 space-y-3 text-base">
            <div>
              <dt className="text-eyebrow text-muted-foreground">Member since</dt>
              <dd className="mt-1 font-medium">{formatDate(user.created_at)}</dd>
            </div>
            <div>
              <dt className="text-eyebrow text-muted-foreground">User ID</dt>
              <dd className="mt-1 font-mono text-sm text-muted-foreground">{user.id}</dd>
            </div>
          </dl>
        </Card>

        <Card className="border-border/70 p-6">
          <h2 className="font-display text-xl font-semibold">Edit profile</h2>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                maxLength={100}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={roleLabel(user.role)} disabled className="h-11" />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
