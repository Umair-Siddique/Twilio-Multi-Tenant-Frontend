import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/features/auth/layout/AuthLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignUpPage } from "@/features/auth/pages/SignUpPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { VerifyOtpPage } from "@/features/auth/pages/VerifyOtpPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { DashboardLayout } from "@/features/tenant/layout/DashboardLayout";
import { DashboardPage } from "@/features/tenant/pages/DashboardPage";
import { TenantProfilePage } from "@/features/tenant/pages/TenantProfilePage";
import { AgentConfigPage } from "@/features/tenant/pages/AgentConfigPage";
import { PhoneNumbersPage } from "@/features/tenant/pages/PhoneNumbersPage";
import { IntegrationsPage } from "@/features/tenant/pages/IntegrationsPage";
import { SuperAdminLayout } from "@/features/super-admin/layout/SuperAdminLayout";
import { SuperAdminDashboardPage } from "@/features/super-admin/pages/SuperAdminDashboardPage";
import { TenantsPage } from "@/features/super-admin/pages/TenantsPage";
import { TenantDetailPage } from "@/features/super-admin/pages/TenantDetailPage";
import { TwilioNumbersPage } from "@/features/super-admin/pages/TwilioNumbersPage";
import { MonitoringPage } from "@/features/super-admin/pages/MonitoringPage";
import { SuperAdminsPage } from "@/features/super-admin/pages/SuperAdminsPage";
import { authSession } from "@/shared/session/authSession";

function isAuthenticated(): boolean {
  const token = authSession.getAccessToken();
  return !!token && token.trim().length > 0;
}

function defaultRoute(): string {
  if (!isAuthenticated()) return "/auth/login";
  return authSession.isSuperAdmin() ? "/super-admin" : "/dashboard";
}

function RequireAuth() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/auth/login" replace />;
}

function RequireSuperAdmin() {
  if (!isAuthenticated()) return <Navigate to="/auth/login" replace />;
  if (!authSession.isSuperAdmin()) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function DefaultRedirect() {
  return <Navigate to={defaultRoute()} replace />;
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <DefaultRedirect />
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "verify-otp", element: <VerifyOtpPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> }
    ]
  },
  {
    path: "/dashboard",
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "profile", element: <TenantProfilePage /> },
          { path: "agent-config", element: <AgentConfigPage /> },
          { path: "phone-numbers", element: <PhoneNumbersPage /> },
          { path: "integrations", element: <IntegrationsPage /> }
        ]
      }
    ]
  },
  {
    path: "/super-admin",
    element: <RequireSuperAdmin />,
    children: [
      {
        element: <SuperAdminLayout />,
        children: [
          { index: true, element: <SuperAdminDashboardPage /> },
          { path: "tenants", element: <TenantsPage /> },
          { path: "tenants/:tenantId", element: <TenantDetailPage /> },
          { path: "twilio", element: <TwilioNumbersPage /> },
          { path: "monitoring", element: <MonitoringPage /> },
          { path: "admins", element: <SuperAdminsPage /> }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <DefaultRedirect />
  }
]);



