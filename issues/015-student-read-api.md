# Implement Student Read API

## Status

Proposed

## Related ADRs / Docs

- [ADR-004](../docs/adr/ADR-004-rest-api-design-and-naming-conventions.md)
- [ADR-005](../docs/adr/ADR-005-pii-and-lgpd-compliance-controls.md)

## Objective

Implement authenticated student list and detail endpoints.

## Scope

- Add student routes and controller for `GET /api/students`.
- Add student routes and controller for `GET /api/students/:studentId`.
- Support `q`, `status`, `subscribedPlan`, `page`, and `pageSize`.
- Mask PII in list responses.
- Return full formatted PII in detail responses.

## Out of Scope

- Create/update/delete endpoints.
- Frontend table.

## Dependencies

- [011-auth-session-endpoints](011-auth-session-endpoints.md)
- [014-student-repository-service](014-student-repository-service.md)

## Expected Changes

- `apps/api/src/routes/student.routes.ts`
- `apps/api/src/controllers/student.controller.ts`
- `apps/api/tests/integration/student-read-api.test.ts`

## Test Cases

- Given no session, when list/detail is requested, then `401 AUTHENTICATION_REQUIRED` is returned.
- Given an authenticated admin, when list is requested, then only non-deleted students are returned.
- Given list response, when inspected, then email, CPF, and phone are masked.
- Given detail response, when inspected, then full formatted PII is returned.
- Given invalid pagination, when list is requested, then `400 VALIDATION_ERROR` is returned.
- Given search by name/email/CPF/phone, when list is requested, then matching students are returned.

## How to Test

```sh
npm test --workspace apps/api -- student-read-api
```

## Acceptance Criteria

- [ ] Read endpoints match ADR-004.
- [ ] Authentication is required.
- [ ] List masking and detail full-PII behavior are tested.
