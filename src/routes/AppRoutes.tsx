import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainLayout } from "@/layouts/MainLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";

const Home = lazy(() => import("@/pages/Home"));
const Track = lazy(() => import("@/pages/Track"));
const About = lazy(() => import("@/pages/About"));
const Apply = lazy(() => import("@/pages/Apply"));
const Requirements = lazy(() => import("@/pages/Requirements"));
const Financing = lazy(() => import("@/pages/Financing"));
const BuyOption = lazy(() => import("@/pages/BuyOption"));
const ExpoNews = lazy(() => import("@/pages/ExpoNews"));
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
    <Suspense fallback={<FallBack />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/programme"
            element={<Navigate to={{ pathname: "/", hash: "path" }} replace />}
          />
          <Route path="/training" element={<Navigate to="/apply" replace />} />
          <Route path="/track" element={<Track />} />
          <Route path="/requirements" element={<Requirements />} />
          <Route path="/financing" element={<Financing />} />
          <Route path="/about" element={<About />} />
          <Route path="/buy/:slug" element={<BuyOption />} />
          <Route path="/news/:slug" element={<ExpoNews />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/account" element={<Navigate to="/track" replace />} />
          <Route path="/account/login" element={<Navigate to="/track" replace />} />
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
  );
}
