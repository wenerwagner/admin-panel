# Scaffold API TypeScript Express App

## Status

Proposed

## Related ADRs / Docs

- [ADR-001](../docs/adr/ADR-001-application-architecture-and-technology-stack.md)
- [ADR-010](../docs/adr/ADR-010-backend-folder-structure-and-module-architecture.md)

## Objective

Create a minimal Express API app in TypeScript with the accepted backend folder boundaries.

## Scope

- Add API package metadata and TypeScript config.
- Create `src/app.ts` and `src/server.ts`.
- Add `GET /api/health`.
- Add basic route registration structure.
- Add API build and dev scripts.

## Out of Scope

- Auth, sessions, Prisma, logging, and student endpoints.
- Docker Compose integration.

## Dependencies

- [001-root-monorepo-scaffold](001-root-monorepo-scaffold.md)

## Expected Changes

- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/src/app.ts`
- `apps/api/src/server.ts`
- `apps/api/src/routes/index.ts`
- `apps/api/src/routes/health.routes.ts`

## Test Cases

- Given the API app, when `GET /api/health` is requested, then it returns `200`.
- Given `app.ts`, when imported by tests, then it does not start a network listener.
- Given `server.ts`, when run, then it starts the HTTP server.

## How to Test

```sh
npm run build --workspace apps/api
npm run dev --workspace apps/api
curl http://localhost:3000/api/health
```

## Acceptance Criteria

- [ ] API compiles with TypeScript.
- [ ] Health endpoint works.
- [ ] `app.ts` and `server.ts` are separated.
- [ ] Folder structure follows ADR-010.
