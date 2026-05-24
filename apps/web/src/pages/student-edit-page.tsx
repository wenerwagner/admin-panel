import { useState } from "react";

import { StudentForm } from "../components/student-form.js";
import { ConfirmDialog } from "../components/ui/confirm-dialog.js";
import { useAuth } from "../hooks/use-auth.js";
import { useDeleteStudent, useStudent, useUpdateStudent } from "../hooks/use-students.js";
import { navigateTo } from "../routes/navigation.js";
import type { CreateStudentRequest } from "../types/api.js";
import { apiErrorMessage } from "../utils/error-messages.js";

export function StudentEditPage({ studentId }: { studentId: string }) {
  const { csrfToken } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const studentQuery = useStudent(studentId);
  const updateStudent = useUpdateStudent(studentId, csrfToken);
  const deleteStudent = useDeleteStudent(csrfToken);

  async function handleSubmit(values: CreateStudentRequest) {
    await updateStudent.mutateAsync(values);
    navigateTo("/", { replace: true });
  }

  async function handleDelete() {
    try {
      await deleteStudent.mutateAsync(studentId);
      navigateTo("/", { replace: true });
    } catch {
      // The visible error message is rendered above the form.
    }
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
        <button className="danger-button" type="button" onClick={() => setIsDeleteDialogOpen(true)}>
          Delete
        </button>
      </div>
      {deleteStudent.error ? (
        <div className="form-error" role="alert">
          {apiErrorMessage(deleteStudent.error)}
        </div>
      ) : null}
      <StudentForm
        initialValues={studentQuery.data}
        isSubmitting={updateStudent.isPending}
        onCancel={() => navigateTo("/")}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
      {isDeleteDialogOpen ? (
        <ConfirmDialog
          confirmLabel="Delete student"
          isConfirming={deleteStudent.isPending}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          title="Delete student?"
          variant="danger"
        >
          <p>
            This will remove {studentQuery.data.name} from the active student list. The record is soft-deleted and cannot
            be restored from this screen.
          </p>
        </ConfirmDialog>
      ) : null}
    </section>
  );
}
