# Migrate Local Issue Drafts to GitHub Issues

## Status

Proposed

## Related ADRs / Docs

- [issues/README.md](README.md)
- [docs/engineering.md](../docs/engineering.md)

## Objective

Move the local issue drafts into GitHub Issues so GitHub becomes the long-term source of truth for implementation work.

## Scope

- Review local issue drafts.
- Create corresponding GitHub Issues.
- Preserve issue order, dependencies, objectives, scope, and acceptance criteria.
- Decide whether to keep, archive, or remove the local `issues/` directory after migration.
- Update documentation to point to GitHub Issues as the active tracker.

## Out of Scope

- Changing the implementation plan unless migration reveals stale or duplicate tasks.
- Implementing the issues being migrated.

## Dependencies

- GitHub repository issue tracker is available.

## Expected Changes

- GitHub Issues created from local drafts.
- `docs/engineering.md`
- `issues/README.md`, if the local directory remains.

## Test Cases

- Given a local issue draft, when migration is complete, then an equivalent GitHub Issue exists.
- Given documentation that references work tracking, when migration is complete, then it points to GitHub Issues as the
  active tracker.

## How to Test

Manual:

- Compare local issue drafts with created GitHub Issues.
- Confirm dependencies and acceptance criteria were preserved.

## Acceptance Criteria

- [ ] Local issue drafts are represented in GitHub Issues.
- [ ] GitHub Issues is documented as the active tracker.
- [ ] The future status of the local `issues/` directory is decided.
