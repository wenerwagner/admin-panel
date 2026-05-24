# Admin Panel

Administrative student management panel for Escola do Breno.

## Local Setup

The current scaffold starts with Docker Compose:

```sh
docker compose up --build
```

Default local URLs:

- Web app: `http://localhost:8080`
- API health: `http://localhost:3000/api/health`
- API through Caddy: `http://localhost:8080/api/health`
- PostgreSQL: `localhost:5432`

Optional local defaults are documented in [.env.example](.env.example). The stack also has built-in defaults, so an
`.env` file is not required for the scaffold.

The API validates environment variables before startup. For production-like runs, provide explicit values for
`DATABASE_URL`, `CSRF_SECRET`, session settings, CORS origins, proxy trust, and log level.

## Backend Tests

Start PostgreSQL, then run the API test suite:

```sh
docker compose up postgres
npm test --workspace apps/api
```

The API test harness uses the local PostgreSQL database with a dedicated `test` schema by default. Set
`TEST_DATABASE_URL` to point tests at a different disposable PostgreSQL database.

## Current Scope

Delivered so far:

- Root npm workspace scaffold
- TypeScript Express API scaffold with `GET /api/health`
- Vite React web scaffold with placeholder login and students pages
- Docker Compose stack with PostgreSQL, API, Caddy-served web app, and a persistent PostgreSQL volume
- Validated API environment configuration
- Prisma schema and initial migration for admins, sessions, and students
- Backend error handling foundation with typed API errors and centralized middleware
- Structured backend request logging with request IDs
- PostgreSQL-backed API test harness with Supertest and Vitest

Not delivered yet:

- Admin login
- Student CRUD
- Admin seed or credentials

The main AI tool used for implementation work is Codex.
