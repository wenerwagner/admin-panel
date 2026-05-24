# Implement Frontend Student Delete Flow

## Status

Proposed

## Related ADRs / Docs

- [ADR-003](../docs/adr/ADR-003-student-domain-model-and-entity-definitions.md)
- [ADR-011](../docs/adr/ADR-011-frontend-folder-structure-and-ui-architecture.md)

## Objective

Add UI support for soft-deleting students.

## Scope

- Add delete action from list or edit page.
- Add confirmation UI.
- Send CSRF token.
- Invalidate list cache after deletion.
- Show safe success/error feedback.

## Out of Scope

- Restore endpoint.
- Hard delete endpoint.
- Audit trail.

## Dependencies

- [021-frontend-student-form-create-edit](021-frontend-student-form-create-edit.md)

## Expected Changes

- `apps/web/src/components/student-table.tsx`
- `apps/web/src/pages/student-edit-page.tsx`
- optional `apps/web/src/components/ui/confirm-dialog.tsx`

## Test Cases

- Given a student row, when delete is clicked, then confirmation is required.
- Given confirmed delete, when API succeeds, then the student disappears from the list.
- Given delete API failure, when it occurs, then a safe error message is shown.
- Given mutation request, when inspected, then CSRF token is included.

## How to Test

```sh
npm run build --workspace apps/web
docker compose up
```

Manual:

- Create a student.
- Delete the student.
- Confirm the student no longer appears in the list.

## Acceptance Criteria

- [ ] Delete uses the API soft-delete endpoint.
- [ ] Confirmation prevents accidental deletion.
- [ ] List cache is invalidated after delete.
