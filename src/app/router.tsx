import { Navigate, createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "@/features/auth/layout/AuthLayout";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignUpPage } from "@/features/auth/pages/SignUpPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { VerifyOtpPage } from "@/features/auth/pages/VerifyOtpPage";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth/login" replace />
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "verify-otp", element: <VerifyOtpPage /> }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />
  }
]);



