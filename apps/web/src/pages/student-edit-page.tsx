import { StudentForm } from "../components/student-form.js";
import { useAuth } from "../hooks/use-auth.js";
import { useStudent, useUpdateStudent } from "../hooks/use-students.js";
import { navigateTo } from "../routes/navigation.js";
import type { CreateStudentRequest } from "../types/api.js";
import { apiErrorMessage } from "../utils/error-messages.js";

export function StudentEditPage({ studentId }: { studentId: string }) {
  const { csrfToken } = useAuth();
  const studentQuery = useStudent(studentId);
  const updateStudent = useUpdateStudent(studentId, csrfToken);

  async function handleSubmit(values: CreateStudentRequest) {
    await updateStudent.mutateAsync(values);
    navigateTo("/", { replace: true });
  }

  if (studentQuery.isPending) {
    return (
      <section className="status-panel list-status" aria-live="polite">
        <p>Loading student...</p>
      </section>
    );
  }

  if (studentQuery.isError) {
    return (
      <section className="form-section">
        <div className="form-error" role="alert">
          {apiErrorMessage(studentQuery.error)}
        </div>
        <button className="secondary-button" type="button" onClick={() => navigateTo("/")}>
          Back to list
        </button>
      </section>
    );
  }

  return (
    <section className="form-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Student record</p>
          <h2>Edit student</h2>
        </div>
      </div>
      <StudentForm
        initialValues={studentQuery.data}
        isSubmitting={updateStudent.isPending}
        onCancel={() => navigateTo("/")}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </section>
  );
}
