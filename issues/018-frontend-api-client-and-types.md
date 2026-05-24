# Add Frontend API Client, Types, and Error Mapping

## Status

Proposed

## Related ADRs / Docs

- [ADR-004](../docs/adr/ADR-004-rest-api-design-and-naming-conventions.md)
- [ADR-008](../docs/adr/ADR-008-application-error-handling-strategy.md)
- [ADR-011](../docs/adr/ADR-011-frontend-folder-structure-and-ui-architecture.md)

## Objective

Create the frontend API access layer used by auth and student pages.

## Scope

- Add shared fetch client.
- Add auth API functions.
- Add student API functions.
- Add manual API TypeScript types.
- Add API error parsing.
- Add centralized user-facing error mapping.

## Out of Scope

- Login UI behavior.
- Student table/forms.

## Dependencies

- [003-web-vite-react-scaffold](003-web-vite-react-scaffold.md)
- [017-openapi-local-docs](017-openapi-local-docs.md)

## Expected Changes

- `apps/web/src/api/client.ts`
- `apps/web/src/api/auth-api.ts`
- `apps/web/src/api/student-api.ts`
- `apps/web/src/types/api.ts`
- `apps/web/src/utils/error-messages.ts`

## Test Cases

- Given an API error response, when parsed, then stable error code and details are preserved.
- Given known error codes, when mapped, then safe user-facing messages are returned.
- Given state-changing requests, when sent, then CSRF token support is available.

## How to Test

```sh
npm run build --workspace apps/web
```

## Acceptance Criteria

- [ ] API types match OpenAPI/ADR response shapes.
- [ ] Error parsing is centralized.
- [ ] Frontend code does not log PII.
