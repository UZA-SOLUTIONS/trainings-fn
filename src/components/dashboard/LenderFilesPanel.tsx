import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLenderFile,
  listLenderFiles,
  updateLenderFile,
  LENDER_REFUSAL_MESSAGE,
  type LoanReviewStatus,
  type LenderFile,
} from "@/services/lenderService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

const LOAN_STATUSES: LoanReviewStatus[] = [
  "not_ready",
  "pending",
  "in_review",
  "approved",
  "declined",
  "more_info_needed",
];

const LOAN_LABELS: Record<string, string> = {
  not_ready: "Not ready",
  pending: "Pending",
  in_review: "In review",
  approved: "Approved",
  declined: "Declined",
  more_info_needed: "More info needed",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/70 p-5">
      <p className="text-eyebrow text-muted-foreground">{title}</p>
      <div className="mt-3 space-y-2 text-base">{children}</div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <p>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium">{value}</span>
    </p>
  );
}

function LenderFileDetail({
  file,
  onUpdated,
}: {
  file: LenderFile;
  onUpdated: () => void;
}) {
  const [notes, setNotes] = useState(file.loanReview.notes ?? "");

  const update = useMutation({
    mutationFn: (patch: { loan_review_status?: LoanReviewStatus; bank_notes?: string | null }) =>
      updateLenderFile(file.identity.uzaId, patch),
    onSuccess: () => {
      toast.success("File updated");
      onUpdated();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mt-8 space-y-4">
      <div>
        <p className="text-eyebrow text-muted-foreground">Borrower file</p>
        <h2 className="mt-1 font-display text-3xl font-bold">{file.identity.displayName}</h2>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{file.identity.uzaId}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Identity">
          <Field label="UZA ID" value={file.identity.uzaId} />
          <Field label="Display name" value={file.identity.displayName} />
        </Section>

        {file.training && (
          <Section title="Training">
            <Field label="Programme" value={file.training.programme} />
            <Field
              label="Completed"
              value={file.training.completedDate ?? "In progress"}
            />
            <Field
              label="Assessment passed"
              value={file.training.assessmentPassed ? "Yes" : "No"}
            />
          </Section>
        )}

        {file.creditEnhancement && (
          <Section title="Credit enhancement">
            <Field label="Pledged" value={file.creditEnhancement.pledged ? "Yes" : "No"} />
            <Field label="Released" value={file.creditEnhancement.released ? "Yes" : "No"} />
            <Field label="Callable" value={file.creditEnhancement.callable ? "Yes" : "No"} />
          </Section>
        )}

        <Section title="Loan review">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={file.loanReview.status}
                onValueChange={(v) =>
                  update.mutate({ loan_review_status: v as LoanReviewStatus })
                }
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LOAN_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Internal notes</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => {
                  if (notes !== (file.loanReview.notes ?? "")) {
                    update.mutate({ bank_notes: notes || null });
                  }
                }}
              />
            </div>
          </div>
        </Section>
      </div>

      <p className="text-sm text-muted-foreground">
        Wallet, inspections and utilisation appear here once those systems adopt the UZA ID.
        Until then those sections are omitted — not shown as empty.
      </p>
    </div>
  );
}

export function LenderFilesPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [lookupCode, setLookupCode] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const { data: files = [], isPending } = useQuery({
    queryKey: ["lender-files"],
    queryFn: listLenderFiles,
  });

  const {
    data: selectedFile,
    isFetching: fileLoading,
    error: fileError,
  } = useQuery({
    queryKey: ["lender-file", selectedCode],
    queryFn: () => getLenderFile(selectedCode!),
    enabled: Boolean(selectedCode),
    retry: false,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return files;
    return files.filter(
      (f) =>
        f.uzaId.toLowerCase().includes(q) ||
        f.displayName.toLowerCase().includes(q),
    );
  }, [files, search]);

  function openFile(code: string) {
    setSelectedCode(code.trim().toUpperCase());
  }

  async function lookupByReference(e: React.FormEvent) {
    e.preventDefault();
    const code = lookupCode.trim().toUpperCase();
    if (!code) return;
    setSelectedCode(code);
  }

  return (
    <div>
      <p className="text-eyebrow text-muted-foreground">Lender view</p>
      <h1 className="mt-2 font-display text-4xl font-bold">Borrower files</h1>
      <p className="mt-2 max-w-2xl text-base text-muted-foreground">
        Consented borrowers only. You see a UZA ID and display name — no national ID, phone,
        or contact details.
      </p>

      <form onSubmit={lookupByReference} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="lender-lookup">Look up by UZA ID</Label>
          <Input
            id="lender-lookup"
            placeholder="UZA-2026-00001"
            value={lookupCode}
            onChange={(e) => setLookupCode(e.target.value)}
            className="h-10 font-mono"
          />
        </div>
        <Button type="submit" variant="outline">
          Open file
        </Button>
      </form>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter consented files…"
          className="h-10 sm:max-w-xs"
        />
        <p className="text-base text-muted-foreground sm:ml-auto">
          {filtered.length} consented file{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      <Card className="mt-4 overflow-hidden border-border/70">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UZA ID</TableHead>
              <TableHead>Display name</TableHead>
              <TableHead>Training</TableHead>
              <TableHead>Loan status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Loading files…
                </TableCell>
              </TableRow>
            )}
            {!isPending &&
              filtered.map((f) => (
                <TableRow key={f.uzaId}>
                  <TableCell className="font-mono font-semibold">{f.uzaId}</TableCell>
                  <TableCell>{f.displayName}</TableCell>
                  <TableCell className="text-muted-foreground">{f.trainingStatus}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {LOAN_LABELS[f.loanReviewStatus] ?? f.loanReviewStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openFile(f.uzaId)}>
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {!isPending && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No consented files match.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {selectedCode && fileLoading && (
        <p className="mt-8 text-muted-foreground">Loading file…</p>
      )}

      {selectedCode && fileError && (
        <Card className="mt-8 border-border/70 p-5">
          <p className="font-medium">{LENDER_REFUSAL_MESSAGE}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Wrong bank, no consent, consent withdrawn, or reference not found — all return the
            same message.
          </p>
        </Card>
      )}

      {selectedFile && (
        <LenderFileDetail
          file={selectedFile}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["lender-files"] });
            queryClient.invalidateQueries({ queryKey: ["lender-file", selectedCode] });
          }}
        />
      )}
    </div>
  );
}
