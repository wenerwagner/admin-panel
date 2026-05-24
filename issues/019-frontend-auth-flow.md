# Implement Frontend Auth Flow

## Status

Proposed

## Related ADRs / Docs

- [ADR-002](../docs/adr/ADR-002-authentication-and-authorization-strategy.md)
- [ADR-011](../docs/adr/ADR-011-frontend-folder-structure-and-ui-architecture.md)

## Objective

Implement login, logout, current-admin loading, and protected routes in the React app.

## Scope

- Add TanStack Query provider.
- Add `useAuth`.
- Implement login form with React Hook Form and Zod.
- Add protected route wrapper.
- Add logout action.
- Store CSRF token in frontend runtime state.

## Out of Scope

- Password reset.
- Admin management.
- Student UI implementation.

## Dependencies

- [018-frontend-api-client-and-types](018-frontend-api-client-and-types.md)

## Expected Changes

- `apps/web/src/hooks/use-auth.ts`
- `apps/web/src/routes/protected-route.tsx`
- `apps/web/src/pages/login-page.tsx`
- `apps/web/src/components/layout/app-layout.tsx`

## Test Cases

- Given invalid credentials, when login fails, then a generic login error is shown.
- Given unauthenticated user, when accessing protected pages, then user is redirected to login.
- Given authenticated user, when `/api/auth/me` succeeds, then protected pages render.
- Given logout, when clicked, then session is revoked and user returns to login.

## How to Test

```sh
npm run build --workspace apps/web
docker compose up
```

Manual:

- Log in with seeded admin.
- Refresh the page and confirm session remains valid.
- Log out and confirm protected pages are inaccessible.

## Acceptance Criteria

- [ ] Auth flow uses backend session cookie.
- [ ] Protected routes are enforced client-side.
- [ ] CSRF token from `/api/auth/me` is available for mutations.
