import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listStudents } from "../api/student-api.js";
import type { StudentListQuery } from "../types/api.js";

export function useStudents(query: StudentListQuery) {
  return useQuery({
    queryKey: ["students", query],
    queryFn: ({ signal }) => listStudents(query, signal),
    placeholderData: keepPreviousData,
    retry: false,
  });
}
