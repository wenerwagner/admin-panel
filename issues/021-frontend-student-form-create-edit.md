# Implement Frontend Student Create and Edit Forms

## Status

Proposed

## Related ADRs / Docs

- [ADR-003](../docs/adr/ADR-003-student-domain-model-and-entity-definitions.md)
- [ADR-008](../docs/adr/ADR-008-application-error-handling-strategy.md)
- [ADR-011](../docs/adr/ADR-011-frontend-folder-structure-and-ui-architecture.md)

## Objective

Build reusable student form flows for creating and editing students.

## Scope

- Add reusable `StudentForm`.
- Add new student page.
- Add edit student page.
- Use React Hook Form and Zod for client validation.
- Fetch full detail before edit.
- Send CSRF token on mutations.
- Map backend validation and conflict errors to fields where possible.

## Out of Scope

- Delete flow.
- Restore or hard delete.

## Dependencies

- [020-frontend-student-list](020-frontend-student-list.md)

## Expected Changes

- `apps/web/src/components/student-form.tsx`
- `apps/web/src/pages/student-new-page.tsx`
- `apps/web/src/pages/student-edit-page.tsx`
- `apps/web/src/utils/error-messages.ts`

## Test Cases

- Given empty required fields, when submitted, then client-side validation errors are shown.
- Given invalid CPF/email/phone rejected by backend, when submitted, then field-level or form-level errors are shown.
- Given duplicate CPF/email conflict, when submitted, then conflict message is shown.
- Given successful create, when mutation completes, then user returns to list or detail and list cache is invalidated.
- Given edit page, when opened, then full student detail is fetched before rendering editable values.

## How to Test

```sh
npm run build --workspace apps/web
docker compose up
```

Manual:

- Create a valid student.
- Try invalid CPF, email, and phone.
- Edit the created student.
- Confirm list refreshes after save.

## Acceptance Criteria

- [ ] Create and edit share the same form component.
- [ ] Backend validation remains authoritative.
- [ ] Mutations send CSRF token.
- [ ] Query cache is invalidated after successful mutations.
