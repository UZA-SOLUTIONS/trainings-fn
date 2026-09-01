import { Outlet } from "react-router-dom";
import { StaffNav } from "@/components/layout/StaffNav";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-muted/25 text-base">
      <StaffNav />
      <div className="min-h-screen pt-14 lg:pl-64 lg:pt-0">
        <main className="px-4 py-6 text-[1.05rem] leading-relaxed sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
