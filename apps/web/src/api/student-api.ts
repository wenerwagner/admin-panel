import { apiRequest } from "./client.js";
import type {
  CreateStudentRequest,
  StudentDetail,
  StudentListQuery,
  StudentListResponse,
  UpdateStudentRequest,
} from "../types/api.js";

export function listStudents(query: StudentListQuery = {}, signal?: AbortSignal): Promise<StudentListResponse> {
  return apiRequest<StudentListResponse>(studentListPath(query), { signal });
}

export function getStudent(studentId: string, signal?: AbortSignal): Promise<StudentDetail> {
  return apiRequest<StudentDetail>(`/students/${encodeURIComponent(studentId)}`, { signal });
}

export function createStudent(
  input: CreateStudentRequest,
  csrfToken: string,
  signal?: AbortSignal,
): Promise<StudentDetail> {
  return apiRequest<StudentDetail>("/students", {
    method: "POST",
    body: input,
    csrfToken,
    signal,
  });
}

export function updateStudent(
  studentId: string,
  input: UpdateStudentRequest,
  csrfToken: string,
  signal?: AbortSignal,
): Promise<StudentDetail> {
  return apiRequest<StudentDetail>(`/students/${encodeURIComponent(studentId)}`, {
    method: "PATCH",
    body: input,
    csrfToken,
    signal,
  });
}

export function deleteStudent(studentId: string, csrfToken: string, signal?: AbortSignal): Promise<void> {
  return apiRequest<void>(`/students/${encodeURIComponent(studentId)}`, {
    method: "DELETE",
    csrfToken,
    signal,
  });
}

function studentListPath(query: StudentListQuery): string {
  const params = new URLSearchParams();

  appendOptional(params, "q", query.q);
  appendOptional(params, "status", query.status);
  appendOptional(params, "subscribedPlan", query.subscribedPlan);
  appendOptional(params, "page", query.page);
  appendOptional(params, "pageSize", query.pageSize);

  const queryString = params.toString();
  return queryString ? `/students?${queryString}` : "/students";
}

function appendOptional(params: URLSearchParams, key: string, value: string | number | undefined): void {
  if (value !== undefined && value !== "") {
    params.set(key, String(value));
  }
}
