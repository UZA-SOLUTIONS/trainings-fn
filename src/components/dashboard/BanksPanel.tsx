import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { createInstitution, deleteInstitution, updateInstitution } from "@/services/institutionService";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  PROGRAMS,
  programLabel,
  useInstitutions,
  type Institution,
} from "@/utils/institutions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Draft = {
  id?: string;
  name: string;
  code: string;
  target_program: string;
  is_active: boolean;
  notes: string;
};

const BLANK: Draft = {
  name: "",
  code: "",
  target_program: "tunga_taxi",
  is_active: true,
  notes: "",
};

export function BanksPanel() {
  const { can } = useAuth();
  const canWrite = can("institutions.write");
  const { data: institutions = [], isLoading } = useInstitutions({ activeOnly: false });
  const [draft, setDraft] = useState<Draft | null>(null);
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        name: d.name.trim(),
        code: d.code.trim().toUpperCase(),
        target_program: d.target_program,
        is_default_for_program: false,
        is_active: d.is_active,
        rate_tiers: [{ max_years: 3, annual_rate: 0.2 }],
        deposit_tiers: [{ max_price_rwf: null, percent: 0.1 }],
        min_client_contribution_rwf: 500_000,
        collateral_percent: 0.3,
        equity_release_percent: 0.9,
        min_term_years: 1,
        max_term_years: 5,
        processing_fee_percent: 0,
        insurance_percent_per_year: 0,
        supports_uza_access_topup: true,
        notes: d.notes.trim() || null,
      };
      if (d.id) {
        return updateInstitution(d.id, payload);
      }
      return createInstitution(payload);
    },
    onSuccess: (inst, d) => {
      toast.success(
        d.id
          ? "Bank partner updated"
          : `Bank partner created · ID ${inst.bank_id || "assigned"}`,
      );
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: deleteInstitution,
    onSuccess: () => {
      toast.success("Bank partner removed");
      queryClient.invalidateQueries({ queryKey: ["institutions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startEdit(inst: Institution) {
    setDraft({
      id: inst.id,
      name: inst.name,
      code: inst.code,
      target_program: inst.target_program,
      is_active: inst.is_active,
      notes: inst.notes ?? "",
    });
  }

  async function copyId(bankId: string) {
    try {
      await navigator.clipboard.writeText(bankId);
      toast.success("Bank ID copied");
    } catch {
      toast.error("Could not copy");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow text-muted-foreground">Admin</p>
          <h1 className="mt-1 font-display text-4xl font-bold">Bank partners</h1>
        </div>
        {canWrite && (
          <Button type="button" onClick={() => setDraft({ ...BLANK })}>
            Add bank partner
          </Button>
        )}
      </div>

      {draft && canWrite && (
        <Card className="mt-6 border-border/70 p-6">
          <h2 className="font-display text-xl font-semibold">
            {draft.id ? "Edit bank partner" : "Create bank partner"}
          </h2>
          {!draft.id && (
            <p className="mt-2 text-sm text-muted-foreground">
              Saving will auto-create a public bank ID (UZA-BANK-…).
            </p>
          )}
          <form
            className="mt-4 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.name.trim() || !draft.code.trim()) {
                toast.error("Name and short code are required");
                return;
              }
              save.mutate(draft);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="bank-name">Bank name</Label>
              <Input
                id="bank-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank-code">Short code</Label>
              <Input
                id="bank-code"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                placeholder="UNGUKA"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Programme</Label>
              <Select
                value={draft.target_program}
                onValueChange={(value) => setDraft({ ...draft, target_program: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={draft.is_active ? "active" : "inactive"}
                onValueChange={(value) => setDraft({ ...draft, is_active: value === "active" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="bank-notes">Notes</Label>
              <Input
                id="bank-notes"
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Saving…" : draft.id ? "Save changes" : "Create bank partner"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setDraft(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="mt-8 overflow-hidden border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bank</TableHead>
              <TableHead>Bank ID</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Loading bank partners…
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              institutions.map((inst) => (
                <TableRow key={inst.id}>
                  <TableCell>
                    <p className="font-medium">{inst.name}</p>
                    <p className="font-mono text-sm text-muted-foreground">{inst.code}</p>
                  </TableCell>
                  <TableCell>
                    {inst.bank_id ? (
                      <button
                        type="button"
                        className="font-mono text-sm font-semibold text-primary hover:underline"
                        onClick={() => void copyId(inst.bank_id!)}
                        title="Copy bank ID"
                      >
                        {inst.bank_id}
                      </button>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {programLabel(inst.target_program)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={inst.is_active ? "default" : "secondary"}>
                      {inst.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {inst.bank_id && (
                        <Button asChild size="sm" variant="outline">
                          <a href={`/track?id=${encodeURIComponent(inst.bank_id)}`} target="_blank" rel="noreferrer">
                            Track
                          </a>
                        </Button>
                      )}
                      {canWrite && (
                        <>
                          <Button type="button" size="sm" variant="outline" onClick={() => startEdit(inst)}>
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            disabled={remove.isPending}
                            onClick={() => {
                              if (!window.confirm(`Remove “${inst.name}”?`)) return;
                              remove.mutate(inst.id);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && institutions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No bank partners yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
