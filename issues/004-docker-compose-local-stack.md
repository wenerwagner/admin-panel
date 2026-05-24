# Add Docker Compose Local Stack

## Status

Proposed

## Related ADRs / Docs

- [ADR-001](../docs/adr/ADR-001-application-architecture-and-technology-stack.md)
- [docs/architecture.md](../docs/architecture.md)

## Objective

Make the application stack start from scratch with Docker Compose.

## Scope

- Add PostgreSQL service.
- Add API service.
- Add web service.
- Add Caddy or equivalent static web serving for the built frontend if ready.
- Add persistent PostgreSQL volume.
- Wire service environment variables.
- Add `.env.example`.

## Out of Scope

- Production hosting runbook.
- Database schema details.
- Auth and student features.

## Dependencies

- [002-api-typescript-express-scaffold](002-api-typescript-express-scaffold.md)
- [003-web-vite-react-scaffold](003-web-vite-react-scaffold.md)

## Expected Changes

- `docker-compose.yml`
- `.env.example`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`
- `apps/web/Caddyfile` if Caddy is selected

## Test Cases

- Given a clean machine with Docker, when `docker compose up` runs, then PostgreSQL, API, and web start.
- Given the stack is up, when `/api/health` is requested through the expected route, then it returns `200`.
- Given the web service is up, when the root URL is opened, then the placeholder app renders.

## How to Test

```sh
docker compose config
docker compose up
curl http://localhost:3000/api/health
```

## Acceptance Criteria

- [ ] `docker compose config` is valid.
- [ ] `docker compose up` starts the stack from scratch.
- [ ] API health is reachable.
- [ ] Web placeholder is reachable.
- [ ] `.env.example` documents required local variables.
