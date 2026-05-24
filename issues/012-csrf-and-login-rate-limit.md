# Add CSRF Protection and Login Rate Limit

## Status

Proposed

## Related ADRs / Docs

- [ADR-002](../docs/adr/ADR-002-authentication-and-authorization-strategy.md)
- [ADR-005](../docs/adr/ADR-005-pii-and-lgpd-compliance-controls.md)

## Objective

Protect authenticated state-changing requests with CSRF tokens and add basic login brute-force protection.

## Scope

- Generate and expose CSRF token from `/api/auth/me`.
- Require `X-CSRF-Token` on protected state-changing requests.
- Add login rate limiting by IP and normalized email where practical.
- Return stable error codes for CSRF/rate-limit failures.

## Out of Scope

- CAPTCHA.
- Permanent account lockout.
- Sliding sessions.

## Dependencies

- [011-auth-session-endpoints](011-auth-session-endpoints.md)

## Expected Changes

- `apps/api/src/lib/csrf.ts`
- `apps/api/src/middleware/csrf.middleware.ts`
- `apps/api/src/middleware/rate-limit.middleware.ts`
- `apps/api/tests/integration/csrf.test.ts`
- `apps/api/tests/integration/login-rate-limit.test.ts`

## Test Cases

- Given an authenticated session without CSRF token, when logout is requested, then request is rejected.
- Given a valid CSRF token, when logout is requested, then request succeeds.
- Given repeated invalid login attempts, when the limit is exceeded, then `429 RATE_LIMITED` is returned.
- Given login request, when no CSRF token is present, then login is still allowed to proceed to credential validation.

## How to Test

```sh
npm test --workspace apps/api -- csrf
npm test --workspace apps/api -- rate-limit
```

## Acceptance Criteria

- [ ] CSRF rules match ADR-002.
- [ ] Login remains CSRF-exempt.
- [ ] Rate-limited responses use the standard error shape.
