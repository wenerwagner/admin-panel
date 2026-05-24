import type { StudentStatus, SubscribedPlan } from "../types/api.js";

const subscribedPlanLabels = {
  basic: "Basic",
  premium: "Premium",
} as const satisfies Record<SubscribedPlan, string>;

const studentStatusLabels = {
  active: "Active",
  paused: "Paused",
  canceled: "Canceled",
} as const satisfies Record<StudentStatus, string>;

export function formatSubscribedPlan(plan: SubscribedPlan): string {
  return subscribedPlanLabels[plan];
}

export function formatStudentStatus(status: StudentStatus): string {
  return studentStatusLabels[status];
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
