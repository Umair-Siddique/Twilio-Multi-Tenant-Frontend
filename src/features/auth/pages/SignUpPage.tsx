import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField } from "@/features/auth/components/FormField";
import { AuthFormActions } from "@/features/auth/components/AuthFormActions";
import {
  SignUpFormValues,
  signUpSchema
} from "@/features/auth/schemas/authSchemas";
import { authApi } from "@/features/auth/api/authApi";
import { authSession } from "@/shared/session/authSession";
import { ApiError } from "@/shared/api/httpClient";

export function SignUpPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      companyName: "",
      timezone: "America/Toronto",
      industry: "",
      defaultRecipients: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values: SignUpFormValues) => {
    setFormError(null);
    try {
      const defaultRecipients = values.defaultRecipients
        ? values.defaultRecipients
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        : [values.email];

      const response = await authApi.signUp({
        email: values.email,
        password: values.password,
        company_name: values.companyName,
        timezone: values.timezone,
        industry: values.industry,
        default_email_recipients: defaultRecipients
      });

      authSession.setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token
      });
      reset();
      navigate("/auth/login");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Unable to create account.";
      setFormError(message);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Create your account to get started."
      footer={
        <p>
          Already have an account? <Link to="/auth/login">Sign in</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        {formError ? <p className="form-status error">{formError}</p> : null}
        <FormField
          id="companyName"
          label="Company Name"
          placeholder="Acme Corp"
          autoComplete="organization"
          error={errors.companyName?.message}
          {...register("companyName")}
        />
        <FormField
          id="timezone"
          label="Timezone"
          placeholder="America/Toronto"
          error={errors.timezone?.message}
          {...register("timezone")}
        />
        <FormField
          id="industry"
          label="Industry"
          placeholder="Healthcare"
          error={errors.industry?.message}
          {...register("industry")}
        />
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
          id="defaultRecipients"
          label="Default Report Recipients (comma separated)"
          placeholder="admin@company.com, support@company.com"
          error={errors.defaultRecipients?.message}
          {...register("defaultRecipients")}
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <AuthFormActions submitLabel="Create account" isSubmitting={isSubmitting} />
      </form>
    </AuthCard>
  );
}

