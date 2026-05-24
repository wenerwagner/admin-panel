# Add Student Repository and Service

## Status

Proposed

## Related ADRs / Docs

- [ADR-003](../docs/adr/ADR-003-student-domain-model-and-entity-definitions.md)
- [ADR-010](../docs/adr/ADR-010-backend-folder-structure-and-module-architecture.md)

## Objective

Implement student persistence and application rules below the HTTP layer.

## Scope

- Add student repository methods.
- Add student service methods for list, detail, create, update, and soft delete.
- Map Prisma enum values to API enum values.
- Enforce soft-deleted exclusion.
- Convert unique constraint failures into `CONFLICT`.

## Out of Scope

- Express routes/controllers.
- Frontend UI.

## Dependencies

- [006-prisma-schema-and-migrations](006-prisma-schema-and-migrations.md)
- [013-student-validation-and-pii-helpers](013-student-validation-and-pii-helpers.md)

## Expected Changes

- `apps/api/src/repositories/student.repository.ts`
- `apps/api/src/services/student.service.ts`
- `apps/api/tests/integration/student.service.test.ts`

## Test Cases

- Given students exist, when listed, then deleted students are excluded.
- Given a deleted student ID, when detail is requested, then `NOT_FOUND` is thrown.
- Given duplicate active email or CPF, when create/update runs, then `CONFLICT` is thrown.
- Given a soft-deleted duplicate email or CPF, when create runs, then it succeeds.

## How to Test

```sh
npm test --workspace apps/api -- student.service
```

## Acceptance Criteria

- [ ] Repository owns Prisma access.
- [ ] Service owns application behavior.
- [ ] Soft-delete and uniqueness behavior are tested.
