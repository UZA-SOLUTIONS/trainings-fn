import { Outlet } from "react-router-dom";
import { StaffNav } from "@/components/layout/StaffNav";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-muted/25">
      <StaffNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
