import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "../hooks/use-auth.js";
import { navigateTo } from "./navigation.js";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAuthError, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (isAuthError || !isAuthenticated)) {
      navigateTo("/login", { replace: true });
    }
  }, [isAuthError, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <main className="app-shell auth-shell">
        <section className="status-panel" aria-live="polite">
          <p>Loading session...</p>
        </section>
      </main>
    );
  }

  if (isAuthError || !isAuthenticated) {
    return null;
  }

  return children;
}
