import { Outlet } from "react-router-dom";
import { StaffNav } from "@/components/layout/StaffNav";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <StaffNav />
      <Outlet />
    </div>
  );
}
