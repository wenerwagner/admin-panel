# Add Backend Error Handling Foundation

## Status

Proposed

## Related ADRs / Docs

- [ADR-004](../docs/adr/ADR-004-rest-api-design-and-naming-conventions.md)
- [ADR-008](../docs/adr/ADR-008-application-error-handling-strategy.md)

## Objective

Implement typed application errors and centralized Express error middleware.

## Scope

- Add error code constants.
- Add application error classes.
- Add validation error mapping.
- Add centralized Express error middleware.
- Ensure unexpected errors return generic `INTERNAL_ERROR`.

## Out of Scope

- Endpoint-specific validation schemas.
- Frontend error handling.

## Dependencies

- [002-api-typescript-express-scaffold](002-api-typescript-express-scaffold.md)

## Expected Changes

- `apps/api/src/errors/app-error.ts`
- `apps/api/src/errors/error-codes.ts`
- `apps/api/src/errors/error-middleware.ts`
- `apps/api/src/errors/validation-error.ts`
- `apps/api/tests/unit/error-mapping.test.ts`

## Test Cases

- Given a typed validation error, when middleware handles it, then response code is `400` and error code is `VALIDATION_ERROR`.
- Given an unknown error, when middleware handles it, then response code is `500` and no stack trace is returned.
- Given sensitive submitted values, when validation errors are returned, then values are not echoed.

## How to Test

```sh
npm test --workspace apps/api -- error
npm run build --workspace apps/api
```

## Acceptance Criteria

- [ ] Error response shape matches ADR-004.
- [ ] Error middleware is registered once.
- [ ] Unit tests cover expected and unexpected errors.
