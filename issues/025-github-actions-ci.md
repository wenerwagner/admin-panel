# Add GitHub Actions CI Workflow

## Status

Proposed

## Related ADRs / Docs

- [docs/engineering.md](../docs/engineering.md)
- [docs/open-questions.md](../docs/open-questions.md)
- [ADR-009 - Testing Strategy](../docs/adr/ADR-009-testing-strategy.md)

## Objective

Add a GitHub Actions CI workflow that runs the repository quality gate on pull requests and pushes to `main`.

## Scope

- Add `.github/workflows/ci.yml`.
- Run the implemented lint or format check.
- Run TypeScript typecheck.
- Run tests.
- Run application build commands.
- Validate Docker Compose configuration.
- Document any final CI commands in `docs/engineering.md`.

## Out of Scope

- Production deployment automation.
- Release publishing automation.
- Coverage percentage enforcement.

## Dependencies

- Application scaffold and package scripts exist.
- Docker Compose configuration exists.
- Test harness exists.

## Expected Changes

- `.github/workflows/ci.yml`
- `docs/engineering.md`

## Test Cases

- Given a pull request, when CI runs, then required quality gate commands execute.
- Given a push to `main`, when CI runs, then required quality gate commands execute.
- Given a failing quality gate command, when CI runs, then the workflow fails.

## How to Test

```sh
# Run the same commands locally that the workflow runs.
```

## Acceptance Criteria

- [ ] CI runs on pull requests.
- [ ] CI runs on pushes to `main`.
- [ ] CI runs the documented quality gate.
- [ ] Deployment automation is not included.
- [ ] `docs/engineering.md` documents the actual CI commands.

## Notes

GitHub Actions is the intended CI provider. CD is deferred until production deployment details are defined.
