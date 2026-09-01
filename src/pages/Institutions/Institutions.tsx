import { Navigate } from "react-router-dom";

export default function Institutions() {
  return <Navigate to="/dashboard?tab=banks" replace />;
}
