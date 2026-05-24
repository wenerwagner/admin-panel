import { z } from "zod";

import { isValidCpf, normalizeCpf } from "../utils/cpf.js";
import { normalizePhone } from "../utils/phone.js";

export const subscribedPlanValues = ["basic", "premium"] as const;
export const studentStatusValues = ["active", "paused", "canceled"] as const;

export type SubscribedPlanInput = (typeof subscribedPlanValues)[number];
export type StudentStatusInput = (typeof studentStatusValues)[number];

export const subscribedPlanToPrisma = {
  basic: "BASIC",
  premium: "PREMIUM",
} as const satisfies Record<SubscribedPlanInput, string>;

export const studentStatusToPrisma = {
  active: "ACTIVE",
  paused: "PAUSED",
  canceled: "CANCELED",
} as const satisfies Record<StudentStatusInput, string>;

const requiredStringSchema = z.string().trim().min(1);

const normalizedEmailSchema = z.string().trim().toLowerCase().email();

const normalizedCpfSchema = z
  .string()
  .trim()
  .refine(isValidCpf, "Invalid CPF")
  .transform((value) => normalizeCpf(value));

const normalizedPhoneSchema = z
  .string()
  .trim()
  .refine((value) => normalizePhone(value) !== undefined, "Invalid phone")
  .transform((value) => normalizePhone(value) as string);

export const createStudentSchema = z.object({
  name: requiredStringSchema,
  email: normalizedEmailSchema,
  cpf: normalizedCpfSchema,
  phone: normalizedPhoneSchema,
  subscribedPlan: z.enum(subscribedPlanValues),
  status: z.enum(studentStatusValues),
});

export const updateStudentSchema = createStudentSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "Invalid value",
});

export const studentListQuerySchema = z.object({
  q: z.string().trim().optional().transform(emptyToUndefined),
  status: z.enum(studentStatusValues).optional(),
  subscribedPlan: z.enum(subscribedPlanValues).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type StudentListQueryInput = z.infer<typeof studentListQuerySchema>;

function emptyToUndefined(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}
