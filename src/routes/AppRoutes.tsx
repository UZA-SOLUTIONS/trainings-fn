import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";

const Home = lazy(() => import("@/pages/Home"));
const Track = lazy(() => import("@/pages/Track"));
const Apply = lazy(() => import("@/pages/Apply"));
const Requirements = lazy(() => import("@/pages/Requirements"));
const Login = lazy(() => import("@/pages/Login"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
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
            <Route path="/track" element={<Track />} />
            <Route path="/requirements" element={<Requirements />} />
            <Route path="/apply" element={<Apply />} />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/auth" element={<Login />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/manage" element={<Navigate to="/dashboard?tab=overview" replace />} />
              <Route path="/institutions" element={<Navigate to="/dashboard?tab=banks" replace />} />
              <Route path="/cohorts/:cohortId" element={<CohortDetail />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
