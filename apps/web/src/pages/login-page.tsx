import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useAuth } from "../hooks/use-auth.js";
import { navigateTo } from "../routes/navigation.js";
import { apiErrorMessage, apiFieldErrors } from "../utils/error-messages.js";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Required").email("Invalid email"),
  password: z.string().min(1, "Required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { isAuthenticated, isLoading, isLoggingIn, login } = useAuth();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigateTo("/", { replace: true });
    }
  }, [isAuthenticated, isLoading]);

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values);
      navigateTo("/", { replace: true });
    } catch (error) {
      const fieldErrors = apiFieldErrors(error);

      for (const [field, message] of Object.entries(fieldErrors)) {
        if (field === "email" || field === "password") {
          setError(field, { message });
        }
      }

      setError("root", { message: apiErrorMessage(error) });
    }
  }

  return (
    <main className="app-shell auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Admin access</p>
        <h1>Login</h1>
        <form className="form-stack" onSubmit={handleSubmit(onSubmit)} noValidate>
          {errors.root?.message ? (
            <p className="form-error" role="alert">
              {errors.root.message}
            </p>
          ) : null}

          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              type="email"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email?.message ? <span className="field-error">{errors.email.message}</span> : null}
          </label>

          <label className="field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              type="password"
              {...register("password")}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password?.message ? <span className="field-error">{errors.password.message}</span> : null}
          </label>

          <button className="primary-button" type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
