# Final Evaluation Pass

## Status

Proposed

## Related ADRs / Docs

- [docs/architecture.md](../docs/architecture.md)
- [docs/open-questions.md](../docs/open-questions.md)

## Objective

Run a final end-to-end quality pass before publishing or submitting the repository.

## Scope

- Run full backend tests.
- Run frontend and backend builds.
- Run Docker Compose from a clean state.
- Manually verify admin login and student CRUD.
- Check docs for consistency with implementation.
- Confirm no `.local` files are intended for public repository.
- Confirm no secrets or generated local data are committed.

## Out of Scope

- Adding new features.
- Production deployment.

## Dependencies

- [023-readme-context-engineering-docs](023-readme-context-engineering-docs.md)

## Expected Changes

- Small documentation fixes only, if needed.
- Optional final checklist notes.

## Test Cases

- Given a fresh checkout, when README setup is followed, then app starts successfully.
- Given seeded or created admin, when logging in, then authenticated student management is available.
- Given student CRUD flow, when create/list/edit/delete is performed, then behavior matches product requirements.
- Given tests and builds, when run, then they pass.

## How to Test

```sh
docker compose config
docker compose up
npm test --workspace apps/api
npm run build --workspace apps/api
npm run build --workspace apps/web
```

Manual:

- Log in.
- Create a student.
- Search or filter the list.
- Edit the student.
- Delete the student.
- Confirm deleted student no longer appears.

## Acceptance Criteria

- [ ] Full stack starts from scratch.
- [ ] Required tests pass.
- [ ] Must-have product flows work manually.
- [ ] README and CONTEXT meet the brief.
- [ ] Public repo does not include secrets or local-only notes.
