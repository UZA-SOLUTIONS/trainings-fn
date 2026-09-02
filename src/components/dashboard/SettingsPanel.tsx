import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import * as authService from "@/services/authService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  loadDashboardPreferences,
  saveDashboardPreferences,
  type DashboardPreferences,
} from "@/components/dashboard/preferences";
import { roleLabel } from "@/lib/permissions";
import { DASHBOARD_TABS, type DashboardTab } from "@/components/dashboard/types";
import { toast } from "sonner";

const WORKSPACE_TABS = DASHBOARD_TABS.filter(
  (t) => t.id !== "profile" && t.id !== "settings",
);

export function SettingsPanel() {
  const navigate = useNavigate();
  const { user, canAccessTab } = useAuth();
  const [prefs, setPrefs] = useState<DashboardPreferences>(() => loadDashboardPreferences());
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  const workspaceTabs = WORKSPACE_TABS.filter((t) => canAccessTab(t.id));

  useEffect(() => {
    saveDashboardPreferences(prefs);
  }, [prefs]);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setPasswordBusy(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setPasswordBusy(false);
    }
  }

  function handleDefaultTabChange(value: DashboardTab) {
    setPrefs((prev) => ({ ...prev, defaultTab: value }));
    toast.success("Default page saved");
  }

  return (
    <div>
      <p className="text-eyebrow text-muted-foreground">Account</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Settings</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70 p-6">
          <h2 className="font-display text-xl font-semibold">Workspace</h2>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="default-tab">Default page after sign-in</Label>
              <Select value={prefs.defaultTab} onValueChange={handleDefaultTabChange}>
                <SelectTrigger id="default-tab" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workspaceTabs.map((tab) => (
                    <SelectItem key={tab.id} value={tab.id}>
                      {tab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate(`/dashboard?tab=${prefs.defaultTab}`)}
              >
                Open default page
              </Button>
            </div>

            <label className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Email notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates about cohort and candidate changes.
                </p>
              </div>
              <Switch
                checked={prefs.emailNotifications}
                onCheckedChange={(checked) =>
                  setPrefs((prev) => ({ ...prev, emailNotifications: checked }))
                }
              />
            </label>
          </div>
        </Card>

        <Card className="border-border/70 p-6">
          <h2 className="font-display text-xl font-semibold">Security</h2>
          <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-11"
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="h-11"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={passwordBusy}>
              {passwordBusy ? "Updating…" : "Update password"}
            </Button>
          </form>
        </Card>

        <Card className="border-border/70 p-6 lg:col-span-2">
          <h2 className="font-display text-xl font-semibold">Session</h2>
          <dl className="mt-4 grid gap-4 text-base sm:grid-cols-2">
            <div>
              <dt className="text-eyebrow text-muted-foreground">Signed in as</dt>
              <dd className="mt-1 font-medium">{user?.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-eyebrow text-muted-foreground">Role</dt>
              <dd className="mt-1 font-medium">{user ? roleLabel(user.role) : "—"}</dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
