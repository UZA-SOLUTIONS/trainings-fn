import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCohort } from "@/services/cohortService";
import {
  createAttendanceSession,
  getAttendanceSession,
  listAttendanceSessions,
  saveAttendanceRecords,
  updateAttendanceSession,
  type AttendanceRosterRow,
  type AttendanceStatus,
  type SessionLabel,
} from "@/services/attendanceService";
import { CohortClassroomHeader } from "@/components/classroom/CohortClassroomHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const STATUSES: AttendanceStatus[] = ["present", "late", "absent", "excused"];

function todayIso() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function CohortAttendance() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can, isBankPartner } = useAuth();
  const canWrite = can("attendance.write");

  const [date, setDate] = useState(todayIso);
  const [sessionLabel, setSessionLabel] = useState<SessionLabel>("full_day");
  const [activityNotes, setActivityNotes] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [roster, setRoster] = useState<AttendanceRosterRow[]>([]);

  useEffect(() => {
    if (isBankPartner) navigate("/dashboard?tab=candidates", { replace: true });
  }, [isBankPartner, navigate]);

  const { data: cohortData, isPending: cohortLoading } = useQuery({
    queryKey: ["cohort", cohortId],
    queryFn: () => getCohort(cohortId!),
    enabled: Boolean(cohortId) && !isBankPartner,
  });

  const { data: existingSessions, isFetching: sessionsLoading } = useQuery({
    queryKey: ["attendance-sessions", cohortId, date, sessionLabel],
    queryFn: () => listAttendanceSessions(cohortId!, { date, session_label: sessionLabel }),
    enabled: Boolean(cohortId) && !isBankPartner,
  });

  const existingId = existingSessions?.[0]?.id ?? null;

  const { data: sessionData, isFetching: sessionLoading } = useQuery({
    queryKey: ["attendance-session", existingId],
    queryFn: () => getAttendanceSession(existingId!),
    enabled: Boolean(existingId),
  });

  useEffect(() => {
    if (sessionData) {
      setSessionId(sessionData.session.id);
      setActivityNotes(sessionData.session.activity_notes ?? "");
      setRoster(sessionData.roster);
      return;
    }
    if (!existingId && cohortData) {
      setSessionId(null);
      setActivityNotes("");
      setRoster(
        cohortData.candidates
          .filter((c) => c.status === "enrolled" || c.status === "graduated")
          .map((c) => ({
            candidate_id: c.id,
            candidate_code: c.candidate_code,
            full_name: c.full_name,
            status: null,
            note: null,
          })),
      );
    }
  }, [sessionData, existingId, cohortData]);

  const markedCount = useMemo(
    () => roster.filter((row) => row.status).length,
    [roster],
  );

  const save = useMutation({
    mutationFn: async () => {
      const marked = roster.filter((row) => row.status);
      if (marked.length === 0) {
        throw new Error("Mark at least one candidate before saving");
      }
      let id = sessionId;
      if (!id) {
        const session = await createAttendanceSession(cohortId!, {
          date,
          session_label: sessionLabel,
          activity_notes: activityNotes.trim() || null,
        });
        id = session.id;
        setSessionId(id);
      } else {
        await updateAttendanceSession(id, { activity_notes: activityNotes.trim() || null });
      }
      return saveAttendanceRecords(
        id,
        marked.map((row) => ({
          candidate_id: row.candidate_id,
          status: row.status as AttendanceStatus,
          note: row.note,
        })),
      );
    },
    onSuccess: (data) => {
      setRoster(data.roster);
      setSessionId(data.session.id);
      toast.success("Attendance saved");
      queryClient.invalidateQueries({ queryKey: ["attendance-sessions", cohortId] });
      queryClient.invalidateQueries({ queryKey: ["attendance-session", data.session.id] });
      queryClient.invalidateQueries({ queryKey: ["cohort", cohortId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function setStatus(candidateId: string, status: AttendanceStatus) {
    setRoster((rows) =>
      rows.map((row) => (row.candidate_id === candidateId ? { ...row, status } : row)),
    );
  }

  function setNote(candidateId: string, note: string) {
    setRoster((rows) =>
      rows.map((row) => (row.candidate_id === candidateId ? { ...row, note } : row)),
    );
  }

  function markAll(status: AttendanceStatus) {
    setRoster((rows) => rows.map((row) => ({ ...row, status })));
  }

  if (isBankPartner) {
    return <p className="text-base text-muted-foreground">Redirecting…</p>;
  }

  const loading = cohortLoading || sessionsLoading || (Boolean(existingId) && sessionLoading);

  return (
    <div>
      <CohortClassroomHeader cohort={cohortData?.cohort} loading={cohortLoading} />

      <section className="mt-8 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Session</Label>
            <Select value={sessionLabel} onValueChange={(v) => setSessionLabel(v as SessionLabel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_day">Full day</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Daily activity notes</Label>
          <Textarea
            value={activityNotes}
            onChange={(e) => setActivityNotes(e.target.value)}
            placeholder="What was taught or done today"
            disabled={!canWrite}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canWrite && (
            <>
              <Button type="button" variant="outline" size="sm" onClick={() => markAll("present")}>
                Mark all present
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => markAll("absent")}>
                Mark all absent
              </Button>
              <Button type="button" disabled={save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? "Saving…" : "Save attendance"}
              </Button>
            </>
          )}
          <p className="text-sm text-muted-foreground">
            {markedCount}/{roster.length} marked
          </p>
        </div>

        {loading ? (
          <p className="text-base text-muted-foreground">Loading roll call…</p>
        ) : roster.length === 0 ? (
          <p className="text-base text-muted-foreground">No enrolled candidates in this cohort.</p>
        ) : (
          <Card className="overflow-hidden border-border/70 shadow-none">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Candidate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Note</TableHead>
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
                        <Select
                          value={row.status ?? undefined}
                          onValueChange={(v) => setStatus(row.candidate_id, v as AttendanceStatus)}
                        >
                          <SelectTrigger className="h-9 w-[140px]">
                            <SelectValue placeholder="Mark" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-muted-foreground">{row.status ?? "—"}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {canWrite ? (
                        <Input
                          value={row.note ?? ""}
                          onChange={(e) => setNote(row.candidate_id, e.target.value)}
                          className="h-9"
                        />
                      ) : (
                        <span className="text-muted-foreground">{row.note || "—"}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </section>
    </div>
  );
}
