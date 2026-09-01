import { Navigate, useSearchParams } from "react-router-dom";

export default function Manage() {
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? "overview";
  return <Navigate to={`/dashboard?tab=${tab === "banks" ? "banks" : "overview"}`} replace />;
}
