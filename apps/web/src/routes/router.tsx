import { AppLayout } from "../components/layout/app-layout.js";
import { LoginPage } from "../pages/login-page.js";
import { StudentEditPage } from "../pages/student-edit-page.js";
import { StudentNewPage } from "../pages/student-new-page.js";
import { StudentsPage } from "../pages/students-page.js";
import { ProtectedRoute } from "./protected-route.js";
import { usePathname } from "./navigation.js";

export function Router() {
  const path = usePathname();
  const studentId = editStudentId(path);

  if (path === "/login") {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        {path === "/students/new" ? <StudentNewPage /> : studentId ? (
          <StudentEditPage studentId={studentId} />
        ) : (
          <StudentsPage />
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}

function editStudentId(path: string): string | null {
  const match = /^\/students\/([^/]+)\/edit$/.exec(path);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
