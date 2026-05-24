import { LoginPage } from "../pages/login-page.js";
import { StudentsPage } from "../pages/students-page.js";

export function Router() {
  const path = window.location.pathname;

  if (path === "/login") {
    return <LoginPage />;
  }

  return <StudentsPage />;
}
