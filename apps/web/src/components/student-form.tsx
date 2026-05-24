import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { CreateStudentRequest, StudentDetail } from "../types/api.js";
import { apiErrorMessage, apiFieldErrors } from "../utils/error-messages.js";

const studentFormSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  email: z.string().trim().min(1, "Required").email("Invalid email"),
  cpf: z.string().trim().min(1, "Required"),
  phone: z.string().trim().min(1, "Required"),
  subscribedPlan: z.enum(["basic", "premium"]),
  status: z.enum(["active", "paused", "canceled"]),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;

type StudentFormProps = {
  initialValues?: StudentDetail;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: CreateStudentRequest) => Promise<void>;
  submitLabel: string;
};

const defaultValues: StudentFormValues = {
  name: "",
  email: "",
  cpf: "",
  phone: "",
  subscribedPlan: "basic",
  status: "active",
};

export function StudentForm({ initialValues, isSubmitting, onCancel, onSubmit, submitLabel }: StudentFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: initialValuesToFormValues(initialValues),
  });

  useEffect(() => {
    reset(initialValuesToFormValues(initialValues));
  }, [initialValues, reset]);

  async function submit(values: StudentFormValues) {
    try {
      await onSubmit(values);
    } catch (error) {
      const fieldErrors = apiFieldErrors(error);

      for (const [field, message] of Object.entries(fieldErrors)) {
        if (isStudentField(field)) {
          setError(field, { message });
        }
      }

      setError("root", { message: apiErrorMessage(error) });
    }
  }

  return (
    <form className="student-form" onSubmit={handleSubmit(submit)} noValidate>
      {errors.root?.message ? (
        <p className="form-error" role="alert">
          {errors.root.message}
        </p>
      ) : null}

      <div className="form-grid">
        <label className="field">
          <span>Name</span>
          <input type="text" {...register("name")} aria-invalid={Boolean(errors.name)} />
          {errors.name?.message ? <span className="field-error">{errors.name.message}</span> : null}
        </label>

        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" {...register("email")} aria-invalid={Boolean(errors.email)} />
          {errors.email?.message ? <span className="field-error">{errors.email.message}</span> : null}
        </label>

        <label className="field">
          <span>CPF</span>
          <input type="text" inputMode="numeric" {...register("cpf")} aria-invalid={Boolean(errors.cpf)} />
          {errors.cpf?.message ? <span className="field-error">{errors.cpf.message}</span> : null}
        </label>

        <label className="field">
          <span>Phone</span>
          <input type="tel" autoComplete="tel" {...register("phone")} aria-invalid={Boolean(errors.phone)} />
          {errors.phone?.message ? <span className="field-error">{errors.phone.message}</span> : null}
        </label>

        <label className="field">
          <span>Plan</span>
          <select {...register("subscribedPlan")} aria-invalid={Boolean(errors.subscribedPlan)}>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
          </select>
          {errors.subscribedPlan?.message ? (
            <span className="field-error">{errors.subscribedPlan.message}</span>
          ) : null}
        </label>

        <label className="field">
          <span>Status</span>
          <select {...register("status")} aria-invalid={Boolean(errors.status)}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="canceled">Canceled</option>
          </select>
          {errors.status?.message ? <span className="field-error">{errors.status.message}</span> : null}
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
        <button className="secondary-button" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function initialValuesToFormValues(student: StudentDetail | undefined): StudentFormValues {
  if (!student) {
    return defaultValues;
  }

  return {
    name: student.name,
    email: student.email,
    cpf: student.cpf,
    phone: student.phone,
    subscribedPlan: student.subscribedPlan,
    status: student.status,
  };
}

function isStudentField(field: string): field is keyof StudentFormValues {
  return field in defaultValues;
}
