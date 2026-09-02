import { Navigate } from "react-router-dom";
import { ModulesPanel } from "@/components/dashboard/ModulesPanel";
import { useAuth } from "@/hooks/useAuth";

export default function Modules() {
  const { canAccessTab } = useAuth();

  if (!canAccessTab("modules")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ModulesPanel />;
}
