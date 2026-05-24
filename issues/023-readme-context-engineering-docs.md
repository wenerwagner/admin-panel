# Complete README, CONTEXT, and Engineering Docs

## Status

Proposed

## Related ADRs / Docs

- [README.md](../README.md)
- [CONTEXT.md](../CONTEXT.md)
- [docs/product.md](../docs/product.md)
- [docs/engineering.md](../docs/engineering.md)

## Objective

Finish required delivery documentation after implementation details exist.

## Scope

- Update README with one-command setup.
- Document admin access credentials or creation command.
- Summarize delivered must-have, nice-to-have, and out-of-scope items.
- Mention primary AI tool used.
- Expand CONTEXT with domain modeling decisions.
- Document engineering commands.
- Document local development, testing, migration, environment, and release commands.

## Out of Scope

- Production legal policy decisions.
- Full production runbook if deployment target is not selected.
- CI workflow implementation.
- GitHub Issues migration.

## Dependencies

- [004-docker-compose-local-stack](004-docker-compose-local-stack.md)
- [010-admin-password-seed-cli](010-admin-password-seed-cli.md)
- [022-frontend-student-delete-flow](022-frontend-student-delete-flow.md)

## Expected Changes

- `README.md`
- `CONTEXT.md`
- `docs/engineering.md`

## Test Cases

- Given README setup steps, when followed from a clean checkout, then the app starts.
- Given admin access docs, when followed, then login succeeds.
- Given CONTEXT, when read independently, then domain entities and modeling decisions are understandable in under five minutes.

## How to Test

```sh
docker compose up
npm test --workspace apps/api
npm run build --workspace apps/api
npm run build --workspace apps/web
```

Manual:

- Follow README from scratch.
- Log in as admin.
- Create, edit, list, and delete a student.

## Acceptance Criteria

- [ ] README satisfies the technical-test deliverables.
- [ ] CONTEXT is domain-focused, not a README duplicate.
- [ ] Engineering docs list real implemented commands.
