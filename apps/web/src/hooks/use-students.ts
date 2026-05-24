import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createStudent, getStudent, listStudents, updateStudent } from "../api/student-api.js";
import type { CreateStudentRequest, StudentListQuery, UpdateStudentRequest } from "../types/api.js";

const studentListQueryKey = ["students"] as const;

function studentDetailQueryKey(studentId: string) {
  return ["student", studentId] as const;
}

export function useStudents(query: StudentListQuery) {
  return useQuery({
    queryKey: [...studentListQueryKey, query],
    queryFn: ({ signal }) => listStudents(query, signal),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useStudent(studentId: string) {
  return useQuery({
    queryKey: studentDetailQueryKey(studentId),
    queryFn: ({ signal }) => getStudent(studentId, signal),
    retry: false,
  });
}

export function useCreateStudent(csrfToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateStudentRequest) => {
      if (!csrfToken) {
        throw new Error("Missing CSRF token");
      }

      return createStudent(input, csrfToken);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentListQueryKey });
    },
  });
}

export function useUpdateStudent(studentId: string, csrfToken: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateStudentRequest) => {
      if (!csrfToken) {
        throw new Error("Missing CSRF token");
      }

      return updateStudent(studentId, input, csrfToken);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: studentListQueryKey }),
        queryClient.invalidateQueries({ queryKey: studentDetailQueryKey(studentId) }),
      ]);
    },
  });
}
