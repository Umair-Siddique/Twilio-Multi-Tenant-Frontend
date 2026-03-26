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
import { authSession } from "@/shared/session/authSession";

function isAuthenticated(): boolean {
  const token = authSession.getAccessToken();
  return !!token && token.trim().length > 0;
}

function RequireAuth() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/auth/login" replace />;
}

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={isAuthenticated() ? "/dashboard" : "/auth/login"} replace />
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
          { path: "phone-numbers", element: <PhoneNumbersPage /> }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to={isAuthenticated() ? "/dashboard" : "/auth/login"} replace />
  }
]);



