import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { FormField } from "@/features/auth/components/FormField";
import { AuthFormActions } from "@/features/auth/components/AuthFormActions";
import {
  ForgotPasswordFormValues,
  forgotPasswordSchema
} from "@/features/auth/schemas/authSchemas";

export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    console.info("Forgot password submit (UI only)", values);
  };

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your registered email and we will send a verification code."
      footer={
        <p>
          Back to <Link to="/auth/login">Sign in</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
        <FormField
          id="email"
          label="Work Email"
          type="email"
          placeholder="admin@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <AuthFormActions
          submitLabel="Send verification code"
          isSubmitting={isSubmitting}
          helperAction={<Link to="/auth/verify-otp">Already have code?</Link>}
        />
      </form>
    </AuthCard>
  );
}



