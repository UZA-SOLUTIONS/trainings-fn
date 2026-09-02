import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";

const Home = lazy(() => import("@/pages/Home"));
const Programme = lazy(() => import("@/pages/Programme"));
const Financing = lazy(() => import("@/pages/Financing"));
const Track = lazy(() => import("@/pages/Track"));
const Apply = lazy(() => import("@/pages/Apply"));
const Requirements = lazy(() => import("@/pages/Requirements"));
const Training = lazy(() => import("@/pages/Training"));
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Courses = lazy(() => import("@/pages/Courses"));
const Modules = lazy(() => import("@/pages/Modules"));
const CohortDetail = lazy(() => import("@/pages/CohortDetail"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function FallBack() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<FallBack />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/programme" element={<Programme />} />
            <Route path="/financing" element={<Financing />} />
            <Route path="/training" element={<Training />} />
            <Route path="/track" element={<Track />} />
            <Route path="/requirements" element={<Requirements />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/auth" element={<Login />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/manage" element={<Navigate to="/dashboard?tab=overview" replace />} />
              <Route path="/institutions" element={<Navigate to="/dashboard?tab=banks" replace />} />
              <Route path="/cohorts/:cohortId" element={<CohortDetail />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
