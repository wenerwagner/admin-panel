import type { ReactNode } from "react";

import { useAuth } from "../../hooks/use-auth.js";
import { navigateTo } from "../../routes/navigation.js";
import { apiErrorMessage } from "../../utils/error-messages.js";

export function AppLayout({ children }: { children: ReactNode }) {
  const { admin, isLoggingOut, logout, logoutError } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      navigateTo("/login", { replace: true });
    } catch {
      // The visible error message is rendered below.
    }
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Escola do Breno</p>
          <h1>Students</h1>
          {admin ? <p className="header-meta">{admin.name} - {admin.email}</p> : null}
        </div>
        <div className="header-actions">
          {logoutError ? <p className="inline-error">{apiErrorMessage(logoutError)}</p> : null}
          <button className="secondary-button" type="button" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Signing out..." : "Log out"}
          </button>
        </div>
      </header>
      {children}
    </main>
  );
}
