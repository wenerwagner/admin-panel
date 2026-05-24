# Implement Student Write API

## Status

Proposed

## Related ADRs / Docs

- [ADR-002](../docs/adr/ADR-002-authentication-and-authorization-strategy.md)
- [ADR-004](../docs/adr/ADR-004-rest-api-design-and-naming-conventions.md)
- [ADR-005](../docs/adr/ADR-005-pii-and-lgpd-compliance-controls.md)

## Objective

Implement authenticated and CSRF-protected create, update, and soft-delete student endpoints.

## Scope

- Add `POST /api/students`.
- Add `PATCH /api/students/:studentId`.
- Add `DELETE /api/students/:studentId`.
- Require valid session and CSRF token.
- Return full formatted PII on create/update.
- Soft-delete students by setting `deletedAt`.

## Out of Scope

- Restore endpoint.
- Hard delete endpoint.
- Bulk operations.

## Dependencies

- [012-csrf-and-login-rate-limit](012-csrf-and-login-rate-limit.md)
- [015-student-read-api](015-student-read-api.md)

## Expected Changes

- `apps/api/src/controllers/student.controller.ts`
- `apps/api/src/routes/student.routes.ts`
- `apps/api/tests/integration/student-write-api.test.ts`

## Test Cases

- Given missing CSRF token, when create/update/delete is requested, then request is rejected.
- Given valid create payload, when requested, then student is created and full formatted PII is returned.
- Given invalid CPF/email/phone, when create/update is requested, then `400 VALIDATION_ERROR` is returned.
- Given duplicate active email or CPF, when create/update is requested, then `409 CONFLICT` is returned.
- Given delete request, when successful, then later list/detail excludes the student.
- Given deleted student, when update is requested, then `404 NOT_FOUND` is returned.

## How to Test

```sh
npm test --workspace apps/api -- student-write-api
```

## Acceptance Criteria

- [ ] Write endpoints match ADR-004.
- [ ] CSRF is enforced.
- [ ] Validation and conflict behavior are tested.
- [ ] Delete is soft delete only.
