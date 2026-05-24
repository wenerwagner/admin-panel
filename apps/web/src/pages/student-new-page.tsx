import { StudentForm } from "../components/student-form.js";
import { useAuth } from "../hooks/use-auth.js";
import { useCreateStudent } from "../hooks/use-students.js";
import { navigateTo } from "../routes/navigation.js";
import type { CreateStudentRequest } from "../types/api.js";

export function StudentNewPage() {
  const { csrfToken } = useAuth();
  const createStudent = useCreateStudent(csrfToken);

  async function handleSubmit(values: CreateStudentRequest) {
    await createStudent.mutateAsync(values);
    navigateTo("/", { replace: true });
  }

  return (
    <section className="form-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Student record</p>
          <h2>New student</h2>
        </div>
      </div>
      <StudentForm
        isSubmitting={createStudent.isPending}
        onCancel={() => navigateTo("/")}
        onSubmit={handleSubmit}
        submitLabel="Create student"
      />
    </section>
  );
}
