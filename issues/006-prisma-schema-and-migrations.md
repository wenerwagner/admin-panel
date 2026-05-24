# Add Prisma Schema and Initial Migration

## Status

Proposed

## Related ADRs / Docs

- [ADR-003](../docs/adr/ADR-003-student-domain-model-and-entity-definitions.md)

## Objective

Create the database schema for admins, sessions, and students.

## Scope

- Configure Prisma.
- Add `AdminUser`, `Session`, and `Student` models.
- Add `SubscribedPlan` and `StudentStatus` enums.
- Map Prisma camelCase fields to snake_case tables/columns.
- Add partial unique indexes for active student email and CPF through migration SQL.

## Out of Scope

- Seed command.
- Repositories or API routes.
- Retention or purge jobs.

## Dependencies

- [004-docker-compose-local-stack](004-docker-compose-local-stack.md)
- [005-api-env-config](005-api-env-config.md)

## Expected Changes

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/**/migration.sql`
- `apps/api/src/lib/prisma.ts`
- `apps/api/package.json` Prisma scripts

## Test Cases

- Given a fresh database, when migrations run, then all tables and indexes are created.
- Given the generated migration SQL, when inspected, then it includes partial unique indexes for non-deleted student
  email and CPF.
- Given Prisma Client generation, when it runs, then models and enums are generated successfully.

## How to Test

```sh
docker compose up postgres
npm run prisma:migrate --workspace apps/api
npm run prisma:generate --workspace apps/api
```

## Acceptance Criteria

- [ ] Prisma schema matches ADR-003.
- [ ] Migration includes partial unique indexes.
- [ ] Database behavior around active uniqueness is covered later by student service/API tests.
