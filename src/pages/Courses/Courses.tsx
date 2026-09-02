import { Navigate } from "react-router-dom";
import { CoursesPanel } from "@/components/dashboard/CoursesPanel";
import { useAuth } from "@/hooks/useAuth";

export default function Courses() {
  const { canAccessTab } = useAuth();

  if (!canAccessTab("courses")) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-0 flex-1 pb-8">
      <CoursesPanel />
    </div>
  );
}
