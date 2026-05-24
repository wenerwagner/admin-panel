# Scaffold Web Vite React App

## Status

Proposed

## Related ADRs / Docs

- [ADR-001](../docs/adr/ADR-001-application-architecture-and-technology-stack.md)
- [ADR-011](../docs/adr/ADR-011-frontend-folder-structure-and-ui-architecture.md)

## Objective

Create the minimal React SPA scaffold with the accepted frontend folder structure.

## Scope

- Add Vite React TypeScript package.
- Add `main.tsx`.
- Add base route shell.
- Add placeholder pages for login and students.
- Add base stylesheet.

## Out of Scope

- Real auth flow.
- API client.
- Student table/form implementation.
- Design polish.

## Dependencies

- [001-root-monorepo-scaffold](001-root-monorepo-scaffold.md)

## Expected Changes

- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/vite.config.ts`
- `apps/web/index.html`
- `apps/web/src/main.tsx`
- `apps/web/src/routes/router.tsx`
- `apps/web/src/pages/login-page.tsx`
- `apps/web/src/pages/students-page.tsx`
- `apps/web/src/styles/index.css`

## Test Cases

- Given the web app, when run locally, then it renders a placeholder page.
- Given the web app, when built, then Vite produces a production build.

## How to Test

```sh
npm run build --workspace apps/web
npm run dev --workspace apps/web
```

## Acceptance Criteria

- [ ] Web app compiles.
- [ ] Vite dev server renders the placeholder.
- [ ] Folder structure follows ADR-011.
