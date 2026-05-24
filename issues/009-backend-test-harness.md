# Add Backend Test Harness with PostgreSQL

## Status

Proposed

## Related ADRs / Docs

- [ADR-009](../docs/adr/ADR-009-testing-strategy.md)

## Objective

Create the API test foundation using Vitest, Supertest, Prisma, and real PostgreSQL.

## Scope

- Configure Vitest for API tests.
- Add Supertest app testing support.
- Add test database setup/reset helpers.
- Add factories for admins and students.
- Add a sample integration test for `/api/health`.

## Out of Scope

- Full auth and student endpoint tests.
- Browser tests.

## Dependencies

- [002-api-typescript-express-scaffold](002-api-typescript-express-scaffold.md)
- [006-prisma-schema-and-migrations](006-prisma-schema-and-migrations.md)

## Expected Changes

- `apps/api/vitest.config.ts`
- `apps/api/tests/setup.ts`
- `apps/api/tests/factories/admin.factory.ts`
- `apps/api/tests/factories/student.factory.ts`
- `apps/api/tests/integration/health.test.ts`

## Test Cases

- Given the test suite, when it starts, then it connects to the test PostgreSQL database.
- Given existing rows, when the reset helper runs, then tests start from a clean state.
- Given `GET /api/health`, when tested through Supertest, then it returns `200`.

## How to Test

```sh
docker compose up postgres
npm test --workspace apps/api
```

## Acceptance Criteria

- [ ] Tests run against real PostgreSQL.
- [ ] Database reset is deterministic.
- [ ] Supertest imports `app.ts` without starting `server.ts`.
