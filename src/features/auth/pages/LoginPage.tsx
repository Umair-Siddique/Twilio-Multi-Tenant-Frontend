import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField } from "@/features/auth/components/FormField";
import { AuthFormActions } from "@/features/auth/components/AuthFormActions";
import { LoginFormValues, loginSchema } from "@/features/auth/schemas/authSchemas";
import { authApi } from "@/features/auth/api/authApi";
import { authSession } from "@/shared/session/authSession";
import { ApiError } from "@/shared/api/httpClient";

export function LoginPage() {
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormMessage(null);
    setFormError(null);
    try {
      const response = await authApi.signIn(values);
      authSession.setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token
      });
      setFormMessage("Sign in successful.");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to sign in.";
      setFormError(message);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to continue to your account."
      footer={
        <p>
          New here? <Link to="/auth/signup">Create account</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        {formMessage ? <p className="form-status">{formMessage}</p> : null}
        {formError ? <p className="form-status error">{formError}</p> : null}
        <FormField
          id="email"
          label="Work Email"
          type="email"
          placeholder="admin@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <AuthFormActions
          submitLabel="Sign in"
          isSubmitting={isSubmitting}
          helperAction={<Link to="/auth/forgot-password">Forgot password?</Link>}
        />
      </form>
    </AuthCard>
  );
}

