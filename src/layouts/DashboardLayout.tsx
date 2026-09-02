import { Outlet } from "react-router-dom";
import { StaffNav } from "@/components/layout/StaffNav";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-muted/25 text-base lg:flex lg:h-dvh lg:overflow-hidden">
      <StaffNav />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col pt-14 lg:ml-64 lg:min-h-0 lg:pt-0">
        <main className="flex min-h-0 flex-1 flex-col px-4 py-5 text-[1.05rem] leading-relaxed sm:px-6 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
