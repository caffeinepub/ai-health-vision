import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import React, { Suspense } from "react";
import Navigation from "./components/Navigation";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

// Lazy-loaded pages
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const OnboardingPage = React.lazy(() => import("./pages/OnboardingPage"));
const DashboardPage = React.lazy(() => import("./pages/DashboardPage"));
const AnalyzePage = React.lazy(() => import("./pages/AnalyzePage"));
const HistoryPage = React.lazy(() => import("./pages/HistoryPage"));
const DoctorsPage = React.lazy(() => import("./pages/DoctorsPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const ReportPage = React.lazy(() => import("./pages/ReportPage"));
const AdminPage = React.lazy(() => import("./pages/AdminPage"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="space-y-3 text-center">
      <div className="w-12 h-12 rounded-full medical-gradient mx-auto animate-pulse" />
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  </div>
);

// Root layout
function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
      <Toaster richColors position="top-right" />
    </div>
  );
}

// Authenticated layout with nav
function AuthLayout() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return <PageLoader />;
  }

  if (!identity) {
    throw redirect({ to: "/login" });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 min-w-0 pb-20 lg:pb-0 lg:pl-64">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

// Route definitions
const rootRoute = createRootRoute({ component: RootLayout });

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <LandingPage />
    </Suspense>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => (
    <Suspense fallback={<PageLoader />}>
      <LoginPage />
    </Suspense>
  ),
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "auth",
  component: AuthLayout,
});

const onboardingRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/onboarding",
  component: OnboardingPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const analyzeRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/analyze",
  component: AnalyzePage,
});

const historyRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/history",
  component: HistoryPage,
});

const doctorsRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/doctors",
  component: DoctorsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const reportRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/report/$id",
  component: ReportPage,
});

const adminRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  authLayoutRoute.addChildren([
    onboardingRoute,
    dashboardRoute,
    analyzeRoute,
    historyRoute,
    doctorsRoute,
    profileRoute,
    reportRoute,
    adminRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
