# Scaffold Root Monorepo Structure

## Status

Proposed

## Related ADRs / Docs

- [ADR-001](../docs/adr/ADR-001-application-architecture-and-technology-stack.md)
- [docs/architecture.md](../docs/architecture.md)

## Objective

Create the root project structure and package-management baseline for the monorepo.

## Scope

- Create `apps/api/` and `apps/web/` directories.
- Add a root `package.json`.
- Configure npm workspaces if npm is used.
- Add root scripts that delegate to API and web where useful.
- Add root `.gitignore`.
- Add base `.editorconfig` or formatting config if selected.

## Out of Scope

- API route implementation.
- React UI implementation.
- Docker Compose services.
- Database schema.

## Dependencies

- Accepted architecture baseline.

## Expected Changes

- `package.json`
- `.gitignore`
- `.editorconfig` or selected equivalent
- `apps/api/`
- `apps/web/`

## Test Cases

- Given a fresh checkout, when dependencies are installed, then workspace package discovery succeeds.
- Given the root scripts, when a script is run before app implementation, then it fails clearly or delegates correctly.

## How to Test

```sh
npm install
npm run --workspaces
```

## Acceptance Criteria

- [ ] Root monorepo structure exists.
- [ ] Package manager metadata is valid.
- [ ] No generated dependency folders are committed.
- [ ] Structure matches ADR-001.
