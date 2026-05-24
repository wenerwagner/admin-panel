# Implement Frontend Student List

## Status

Proposed

## Related ADRs / Docs

- [ADR-004](../docs/adr/ADR-004-rest-api-design-and-naming-conventions.md)
- [ADR-011](../docs/adr/ADR-011-frontend-folder-structure-and-ui-architecture.md)

## Objective

Build the authenticated student list page with search, filters, pagination, and masked PII display.

## Scope

- Add `useStudents`.
- Add student table component.
- Add search input.
- Add status and subscribed-plan filters.
- Add pagination controls.
- Link to create and edit pages.

## Out of Scope

- Create/edit form implementation.
- Delete action.

## Dependencies

- [019-frontend-auth-flow](019-frontend-auth-flow.md)

## Expected Changes

- `apps/web/src/hooks/use-students.ts`
- `apps/web/src/components/student-table.tsx`
- `apps/web/src/pages/students-page.tsx`
- `apps/web/src/utils/formatters.ts`

## Test Cases

- Given authenticated admin, when students are loaded, then list rows render with masked PII from the API.
- Given search text, when submitted or changed, then the `q` query param is sent.
- Given status/plan filters, when selected, then corresponding query params are sent.
- Given pagination controls, when used, then page/pageSize change.
- Given API error, when list fails, then a safe error message is shown.

## How to Test

```sh
npm run build --workspace apps/web
docker compose up
```

Manual:

- Log in.
- Visit the student list.
- Search and filter seeded or manually created records.
- Confirm no full CPF or phone appears in list rows.

## Acceptance Criteria

- [ ] Student list uses TanStack Query.
- [ ] Search/filter/pagination call the accepted API params.
- [ ] UI displays list-safe PII only.
