# Add Backend Logging and Request IDs

## Status

Proposed

## Related ADRs / Docs

- [ADR-005](../docs/adr/ADR-005-pii-and-lgpd-compliance-controls.md)
- [ADR-007](../docs/adr/ADR-007-backend-logging-and-observability-strategy.md)

## Objective

Add structured backend logging with request IDs and PII-safe request logging.

## Scope

- Configure `pino`.
- Add request ID middleware.
- Add request completion logging.
- Include `X-Request-Id` response header.
- Redact known sensitive fields and headers.

## Out of Scope

- External observability services.
- Audit logging.

## Dependencies

- [005-api-env-config](005-api-env-config.md)
- [007-backend-error-handling](007-backend-error-handling.md)

## Expected Changes

- `apps/api/src/lib/logger.ts`
- `apps/api/src/lib/request-id.ts`
- `apps/api/src/middleware/request-logging.middleware.ts`
- `apps/api/tests/integration/request-logging.test.ts`

## Test Cases

- Given a request without `X-Request-Id`, when handled, then the response includes a generated request ID.
- Given a safe incoming `X-Request-Id`, when handled, then the response includes it.
- Given a request with cookies or sensitive body fields, when logged, then sensitive values are not present.

## How to Test

```sh
npm test --workspace apps/api -- request-logging
npm run build --workspace apps/api
```

## Acceptance Criteria

- [ ] Request IDs are present on responses.
- [ ] Request logs include method, route, status, duration, and request ID.
- [ ] Tests verify sensitive values are not logged in covered paths.
