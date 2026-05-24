export type ErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "INVALID_CREDENTIALS"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export type ApiErrorDetail = {
  field?: string;
  message: string;
};

export type ApiErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
    details?: ApiErrorDetail[];
    requestId?: string;
  };
};

export type Admin = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  admin: Admin;
};

export type CurrentAdminResponse = AuthResponse & {
  csrfToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type SubscribedPlan = "basic" | "premium";

export type StudentStatus = "active" | "paused" | "canceled";

export type StudentDetail = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  subscribedPlan: SubscribedPlan;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
};

export type StudentSummary = StudentDetail;

export type StudentListQuery = {
  q?: string;
  status?: StudentStatus;
  subscribedPlan?: SubscribedPlan;
  page?: number;
  pageSize?: number;
};

export type StudentListResponse = {
  data: StudentSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type CreateStudentRequest = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  subscribedPlan: SubscribedPlan;
  status: StudentStatus;
};

export type UpdateStudentRequest = Partial<CreateStudentRequest>;
