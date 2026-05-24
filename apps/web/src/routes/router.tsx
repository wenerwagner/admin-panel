import { AppLayout } from "../components/layout/app-layout.js";
import { LoginPage } from "../pages/login-page.js";
import { StudentsPage } from "../pages/students-page.js";
import { ProtectedRoute } from "./protected-route.js";
import { usePathname } from "./navigation.js";

export function Router() {
  const path = usePathname();

  if (path === "/login") {
    return <LoginPage />;
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <StudentsPage />
      </AppLayout>
    </ProtectedRoute>
  );
}
