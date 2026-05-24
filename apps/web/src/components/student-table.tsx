import type { StudentSummary } from "../types/api.js";
import { navigateTo } from "../routes/navigation.js";
import { formatDateTime, formatStudentStatus, formatSubscribedPlan } from "../utils/formatters.js";

export function StudentTable({ students }: { students: StudentSummary[] }) {
  if (students.length === 0) {
    return (
      <div className="empty-state">
        <h2>No students found</h2>
        <p>Try changing the search or filters.</p>
      </div>
    );
  }

  return (
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
