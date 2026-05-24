import { type FormEvent, useMemo, useState } from "react";

import { StudentTable } from "../components/student-table.js";
import { useStudents } from "../hooks/use-students.js";
import { navigateTo } from "../routes/navigation.js";
import type { StudentListQuery, StudentStatus, SubscribedPlan } from "../types/api.js";
import { apiErrorMessage } from "../utils/error-messages.js";

const defaultPageSize = 20;

export function StudentsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StudentStatus | "">("");
  const [subscribedPlan, setSubscribedPlan] = useState<SubscribedPlan | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const query = useMemo<StudentListQuery>(
    () => ({
      q: search || undefined,
      status: status || undefined,
      subscribedPlan: subscribedPlan || undefined,
      page,
      pageSize,
    }),
    [page, pageSize, search, status, subscribedPlan],
  );
  const studentsQuery = useStudents(query);
  const students = studentsQuery.data?.data ?? [];
  const totalPages = Math.max(studentsQuery.data?.totalPages ?? 1, 1);
  const total = studentsQuery.data?.total ?? 0;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function handleStatusChange(value: StudentStatus | "") {
    setStatus(value);
    setPage(1);
  }

  function handleSubscribedPlanChange(value: SubscribedPlan | "") {
    setSubscribedPlan(value);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  return (
    <section className="list-section">
      <div className="list-toolbar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <label className="search-field">
            <span>Search</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Name, email, CPF, or phone"
            />
          </label>
          <button className="secondary-button" type="submit">
            Search
          </button>
        </form>

        <div className="filter-row">
          <label className="select-field">
            <span>Status</span>
            <select value={status} onChange={(event) => handleStatusChange(event.target.value as StudentStatus | "")}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="canceled">Canceled</option>
            </select>
          </label>
          <label className="select-field">
            <span>Plan</span>
            <select
              value={subscribedPlan}
              onChange={(event) => handleSubscribedPlanChange(event.target.value as SubscribedPlan | "")}
            >
              <option value="">All</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
          </label>
          <label className="select-field compact-select">
            <span>Rows</span>
            <select value={pageSize} onChange={(event) => handlePageSizeChange(Number(event.target.value))}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>

        <a
          className="primary-link"
          href="/students/new"
          onClick={(event) => {
            event.preventDefault();
            navigateTo("/students/new");
          }}
        >
          New student
        </a>
      </div>

      {studentsQuery.isError ? (
        <div className="form-error" role="alert">
          {apiErrorMessage(studentsQuery.error)}
        </div>
      ) : null}

      {studentsQuery.isPending ? (
        <div className="status-panel list-status" aria-live="polite">
          <p>Loading students...</p>
        </div>
      ) : (
        <StudentTable students={students} />
      )}

      <footer className="pagination-bar">
        <p>
          {studentsQuery.isFetching && !studentsQuery.isPending ? "Refreshing... " : ""}
          {total} students
        </p>
        <div className="pagination-actions">
          <button className="secondary-button" type="button" onClick={() => setPage(page - 1)} disabled={page <= 1}>
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="secondary-button"
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </footer>
    </section>
  );
}
