# Add OpenAPI Specification and Local Swagger UI

## Status

Proposed

## Related ADRs / Docs

- [ADR-006](../docs/adr/ADR-006-api-documentation-and-openapi-strategy.md)

## Objective

Document the v1 API contract in a maintained OpenAPI file and expose Swagger UI only for local development.

## Scope

- Add OpenAPI specification file.
- Document auth endpoints.
- Document student endpoints.
- Document request/response schemas.
- Document auth cookie and CSRF requirements.
- Add local-only Swagger UI endpoint.

## Out of Scope

- Generating OpenAPI from code.
- Generating frontend types from OpenAPI.
- Production Swagger UI exposure.

## Dependencies

- [016-student-write-api](016-student-write-api.md)

## Expected Changes

- `apps/api/openapi.yaml` or `docs/openapi.yaml`
- `apps/api/src/routes/docs.routes.ts`
- `apps/api/tests/integration/openapi-docs.test.ts`

## Test Cases

- Given local/development environment, when `/api/docs` is requested, then Swagger UI is available.
- Given production environment, when `/api/docs` is requested, then it is not publicly exposed.
- Given the OpenAPI file, when parsed, then it is valid YAML/OpenAPI.

## How to Test

```sh
npm test --workspace apps/api -- openapi
npm run build --workspace apps/api
```

## Acceptance Criteria

- [ ] OpenAPI covers all v1 endpoints.
- [ ] Shared error schema matches ADR-004 and ADR-008.
- [ ] Swagger UI is local-only.
