import { useState } from "react";

import { useAuth } from "../hooks/use-auth.js";
import { useDeleteStudent } from "../hooks/use-students.js";
import type { StudentSummary } from "../types/api.js";
import { navigateTo } from "../routes/navigation.js";
import { apiErrorMessage } from "../utils/error-messages.js";
import { formatDateTime, formatStudentStatus, formatSubscribedPlan } from "../utils/formatters.js";
import { ConfirmDialog } from "./ui/confirm-dialog.js";

export function StudentTable({ students }: { students: StudentSummary[] }) {
  const { csrfToken } = useAuth();
  const deleteStudent = useDeleteStudent(csrfToken);
  const [studentToDelete, setStudentToDelete] = useState<StudentSummary | null>(null);

  async function handleDelete() {
    if (!studentToDelete) {
      return;
    }

    try {
      await deleteStudent.mutateAsync(studentToDelete.id);
      setStudentToDelete(null);
    } catch {
      // The visible error message is rendered above the table.
    }
  }

  if (students.length === 0) {
    return (
      <div className="empty-state">
        <h2>No students found</h2>
        <p>Try changing the search or filters.</p>
      </div>
    );
  }

  return (
    <>
      {deleteStudent.error ? (
        <div className="form-error" role="alert">
          {apiErrorMessage(deleteStudent.error)}
        </div>
      ) : null}
      <div className="table-wrap">
        <table className="student-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">CPF</th>
              <th scope="col">Phone</th>
              <th scope="col">Plan</th>
              <th scope="col">Status</th>
              <th scope="col">Updated</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <strong>{student.name}</strong>
                </td>
                <td>{student.email}</td>
                <td>{student.cpf}</td>
                <td>{student.phone}</td>
                <td>{formatSubscribedPlan(student.subscribedPlan)}</td>
                <td>
                  <span className={`status-badge status-${student.status}`}>{formatStudentStatus(student.status)}</span>
                </td>
                <td>{formatDateTime(student.updatedAt)}</td>
                <td>
                  <div className="table-actions">
                    <a
                      className="table-action"
                      href={`/students/${student.id}/edit`}
                      onClick={(event) => {
                        event.preventDefault();
                        navigateTo(`/students/${student.id}/edit`);
                      }}
                    >
                      Edit
                    </a>
                    <button className="table-action danger-action" type="button" onClick={() => setStudentToDelete(student)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {studentToDelete ? (
        <ConfirmDialog
          confirmLabel="Delete student"
          isConfirming={deleteStudent.isPending}
          onCancel={() => setStudentToDelete(null)}
          onConfirm={handleDelete}
          title="Delete student?"
          variant="danger"
        >
          <p>
            This will remove {studentToDelete.name} from the active student list. The record is soft-deleted and cannot
            be restored from this screen.
          </p>
        </ConfirmDialog>
      ) : null}
    </>
  );
}
