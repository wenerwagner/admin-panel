import { formatCpf, normalizeCpf } from "./cpf.js";
import { formatPhone, normalizePhone } from "./phone.js";

export function maskEmail(email: string): string {
  const [localPart = "", domain = ""] = email.split("@");

  if (!localPart || !domain) {
    return "***";
  }

  return `${localPart[0]}***@${domain}`;
}

export function maskCpf(cpf: string): string {
  const digits = normalizeCpf(cpf);

  if (digits.length !== 11) {
    return "***.***.***-**";
  }

  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export function maskPhone(phone: string): string {
  const normalized = normalizePhone(phone);

  if (!normalized) {
    return "(**) *****-****";
  }

  const digits = normalized.replace(/\D/g, "");
  const lastFour = digits.slice(-4);
  return `(**) *****-${lastFour}`;
}

export function formatSensitiveStudentFields<T extends { cpf: string; phone: string }>(student: T): T {
  return {
    ...student,
    cpf: formatCpf(student.cpf),
    phone: formatPhone(student.phone),
  };
}

export function maskSensitiveStudentFields<T extends { email: string; cpf: string; phone: string }>(student: T): T {
  return {
    ...student,
    email: maskEmail(student.email),
    cpf: maskCpf(student.cpf),
    phone: maskPhone(student.phone),
  };
}
