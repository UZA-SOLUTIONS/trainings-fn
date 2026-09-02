import { Navigate } from "react-router-dom";

export default function Manage() {
  return <Navigate to="/dashboard?tab=overview" replace />;
}
