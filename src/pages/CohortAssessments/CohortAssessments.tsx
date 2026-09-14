import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCohort } from "@/services/cohortService";
import {
  createAssessment,
  getAssessment,
  listAssessments,
  saveAssessmentScores,
  type Assessment,
  type AssessmentRosterRow,
  type AssessmentType,
} from "@/services/assessmentService";
import { CohortClassroomHeader } from "@/components/classroom/CohortClassroomHeader";
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
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

function todayIso() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function CohortAssessments() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can, isBankPartner } = useAuth();
  const canWrite = can("assessments.write");

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AssessmentType>("quiz");
  const [maxScore, setMaxScore] = useState("100");
  const [date, setDate] = useState(todayIso);
  const [isFinal, setIsFinal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [roster, setRoster] = useState<AssessmentRosterRow[]>([]);

  useEffect(() => {
    if (isBankPartner) navigate("/dashboard?tab=candidates", { replace: true });
  }, [isBankPartner, navigate]);

  const { data: cohortData, isPending: cohortLoading } = useQuery({
    queryKey: ["cohort", cohortId],
    queryFn: () => getCohort(cohortId!),
    enabled: Boolean(cohortId) && !isBankPartner,
  });

  const { data: assessments = [], isPending: listLoading } = useQuery({
    queryKey: ["assessments", cohortId],
    queryFn: () => listAssessments(cohortId!),
    enabled: Boolean(cohortId) && !isBankPartner,
  });

  const { data: selected, isFetching: selectedLoading } = useQuery({
    queryKey: ["assessment", selectedId],
    queryFn: () => getAssessment(selectedId!),
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    if (selected) setRoster(selected.roster);
  }, [selected]);

  const create = useMutation({
    mutationFn: () =>
      createAssessment(cohortId!, {
        title: title.trim(),
        type,
        max_score: Number(maxScore) || 100,
        date,
        is_final: type === "exam" ? isFinal : false,
      }),
    onSuccess: (assessment) => {
      toast.success("Assessment created");
      setTitle("");
      setIsFinal(false);
      setSelectedId(assessment.id);
      queryClient.invalidateQueries({ queryKey: ["assessments", cohortId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveScores = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("Select an assessment first");
      const payload = roster
        .map((row) => ({
          candidate_id: row.candidate_id,
          score: row.score,
          remarks: row.remarks,
        }))
        .filter((row): row is { candidate_id: string; score: number; remarks: string | null } =>
          row.score != null && Number.isFinite(row.score),
        );
      if (payload.length === 0) throw new Error("Enter at least one score before saving");
      return saveAssessmentScores(selectedId, payload);
    },
    onSuccess: (data) => {
      setRoster(data.roster);
      toast.success("Scores saved");
      queryClient.invalidateQueries({ queryKey: ["assessment", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["cohort", cohortId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function setScore(candidateId: string, value: string) {
    setRoster((rows) =>
      rows.map((row) =>
        row.candidate_id === candidateId
          ? { ...row, score: value === "" ? null : Number(value) }
          : row,
      ),
    );
  }

  function setRemarks(candidateId: string, remarks: string) {
    setRoster((rows) =>
      rows.map((row) => (row.candidate_id === candidateId ? { ...row, remarks } : row)),
    );
  }

  if (isBankPartner) {
    return <p className="text-base text-muted-foreground">Redirecting…</p>;
  }

  const selectedAssessment: Assessment | undefined = selected?.assessment;

  return (
    <div>
      <CohortClassroomHeader cohort={cohortData?.cohort} loading={cohortLoading} />

      <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="space-y-6">
          {canWrite && (
            <Card className="space-y-4 p-5">
              <h2 className="font-display text-xl font-semibold">New quiz, test, or exam</h2>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AssessmentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="test">Test</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Max score</Label>
                <Input type="number" min={1} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
              </div>
              {type === "exam" && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isFinal}
                    onChange={(e) => setIsFinal(e.target.checked)}
                  />
                  Official final exam (updates candidate exam score)
                </label>
              )}
              <Button
                type="button"
                disabled={create.isPending || title.trim().length < 2}
                onClick={() => create.mutate()}
              >
                {create.isPending ? "Creating…" : "Create"}
              </Button>
            </Card>
          )}

          <div>
            <h2 className="text-eyebrow text-muted-foreground">Assessments</h2>
            {listLoading ? (
              <p className="mt-3 text-base text-muted-foreground">Loading…</p>
            ) : assessments.length === 0 ? (
              <p className="mt-3 text-base text-muted-foreground">No assessments yet.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {assessments.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      selectedId === item.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{item.title}</p>
                      <Badge variant="secondary">{item.type}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.date} · /{item.max_score}
                      {item.is_final ? " · final exam" : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          {!selectedId ? (
            <p className="text-base text-muted-foreground">Select an assessment to enter scores.</p>
          ) : selectedLoading && !selectedAssessment ? (
            <p className="text-base text-muted-foreground">Loading scores…</p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold">{selectedAssessment?.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    Max {selectedAssessment?.max_score} · {selectedAssessment?.type}
                  </p>
                </div>
                {canWrite && (
                  <Button type="button" disabled={saveScores.isPending} onClick={() => saveScores.mutate()}>
                    {saveScores.isPending ? "Saving…" : "Save scores"}
                  </Button>
                )}
              </div>
              <Card className="overflow-hidden border-border/70 shadow-none">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Candidate</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roster.map((row) => (
                      <TableRow key={row.candidate_id}>
                        <TableCell>
                          <p className="font-medium">{row.full_name}</p>
                          <p className="mt-0.5 font-mono text-sm text-primary">{row.candidate_code}</p>
                        </TableCell>
                        <TableCell>
                          {canWrite ? (
                            <Input
                              type="number"
                              min={0}
                              max={selectedAssessment?.max_score}
                              className="h-9 w-28"
                              value={row.score ?? ""}
                              onChange={(e) => setScore(row.candidate_id, e.target.value)}
                            />
                          ) : (
                            row.score ?? "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {canWrite ? (
                            <Input
                              className="h-9"
                              value={row.remarks ?? ""}
                              onChange={(e) => setRemarks(row.candidate_id, e.target.value)}
                            />
                          ) : (
                            row.remarks || "—"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
