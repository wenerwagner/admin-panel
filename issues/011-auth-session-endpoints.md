# Implement Auth Session Endpoints

## Status

Proposed

## Related ADRs / Docs

- [ADR-002](../docs/adr/ADR-002-authentication-and-authorization-strategy.md)
- [ADR-004](../docs/adr/ADR-004-rest-api-design-and-naming-conventions.md)

## Objective

Implement login, current-admin, and logout endpoints using opaque database-backed sessions.

## Scope

- Add auth schemas, routes, controller, service, and repositories.
- Create high-entropy session tokens.
- Store only session token hashes.
- Set HTTP-only session cookie.
- Reject inactive admins.
- Revoke session on logout.

## Out of Scope

- CSRF enforcement.
- Login rate limiting.
- Password reset.

## Dependencies

- [010-admin-password-seed-cli](010-admin-password-seed-cli.md)
- [007-backend-error-handling](007-backend-error-handling.md)

## Expected Changes

- `apps/api/src/schemas/auth.schema.ts`
- `apps/api/src/routes/auth.routes.ts`
- `apps/api/src/controllers/auth.controller.ts`
- `apps/api/src/services/auth.service.ts`
- `apps/api/src/repositories/admin-user.repository.ts`
- `apps/api/src/repositories/session.repository.ts`
- `apps/api/src/middleware/auth.middleware.ts`
- `apps/api/tests/integration/auth.test.ts`

## Test Cases

- Given valid credentials, when login succeeds, then a session cookie is set and admin summary is returned.
- Given invalid credentials, when login fails, then `401 INVALID_CREDENTIALS` is returned generically.
- Given an inactive admin, when login is attempted, then authentication fails.
- Given a valid session, when `/api/auth/me` is requested, then admin summary is returned.
- Given logout, when the old cookie is reused, then `/api/auth/me` returns unauthenticated.

## How to Test

```sh
npm test --workspace apps/api -- auth
npm run build --workspace apps/api
```

## Acceptance Criteria

- [ ] Auth endpoints match ADR-004.
- [ ] Raw session tokens are never stored.
- [ ] Inactive admin behavior is tested.
- [ ] Logout revokes sessions.
