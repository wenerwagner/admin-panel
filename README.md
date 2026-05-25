# Admin Panel

Administrative student management panel for Escola do Breno.

## Prerequisites

- Docker with Docker Compose

## Quick Start

```sh
docker compose up
```

This command starts PostgreSQL, runs database migrations, creates the local admin user, seeds demo student records,
starts the API, and serves the web app through Caddy.

Then sign in at `http://localhost:8080` with:

```text
Email: admin@example.com
Password: local-admin-password
```

Default local URLs:

- Web app: `http://localhost:8080`
- API health: `http://localhost:3000/api/health`
- API docs: `http://localhost:3000/api/docs`
- API through Caddy: `http://localhost:8080/api/health`
- PostgreSQL: `localhost:5432`

Optional local defaults are documented in [.env.example](.env.example). The stack also has built-in defaults, so an
`.env` file is not required for the scaffold.

The API validates environment variables before startup. For production-like runs, provide explicit values for
`DATABASE_URL`, `CSRF_SECRET`, session settings, CORS origins, proxy trust, and log level.

## Common Commands

Install Node dependencies only when running local checks or workspace scripts outside Docker:

```sh
npm install
```

Run all implemented checks that do not require extra setup:

```sh
npm run typecheck
npm run build
npm test --workspace apps/web
docker compose config
```

Start PostgreSQL, then run the API test suite:

```sh
docker compose up postgres
npm test --workspace apps/api
```

The API test harness uses the configured PostgreSQL database and resets application tables before each test. Set
`TEST_DATABASE_URL` to point tests at a disposable PostgreSQL database.

## Admin User

There is no public registration endpoint and no committed default production admin. `docker compose up` creates only the
local development admin from `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME`, defaulting to:

```text
Email: admin@example.com
Password: local-admin-password
Name: Local Admin
```

For manual local setup outside Compose, create an admin intentionally after PostgreSQL is running:

```sh
npm run admin:create --workspace apps/api -- --email admin@example.com --password local-admin-password --name "Local Admin"
```

`npm run seed --workspace apps/api` runs the same command and can read `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and
`ADMIN_NAME` from the environment. Existing admin emails fail explicitly and do not overwrite the stored password.
`npm run local:seed --workspace apps/api` is idempotent and seeds the local admin plus demo student data.

## Delivered Scope

Must-have product scope delivered:

- Admin login with PostgreSQL-backed HTTP-only cookie sessions.
- Student CRUD in the authenticated web UI: list, create, edit, and soft delete.
- Student REST API endpoints for list, detail, create, update, and delete.
- Required student fields: name, email, CPF, phone, subscribed plan, and status.
- Docker Compose stack with PostgreSQL, API, Caddy-served web app, and a persistent PostgreSQL volume.

Nice-to-have and engineering scope delivered:

- Student list search, status filter, subscribed-plan filter, and pagination.
- Soft delete for student records.
- Local-only Swagger UI at `GET /api/docs`.
- Validated API environment configuration.
- Prisma migrations for admins, sessions, and students.
- Admin create/seed command.
- Backend API tests with Vitest, Supertest, and real PostgreSQL.
- Focused frontend API utility tests.
- GitHub Actions CI workflow for pull requests and pushes to `main`.
- Structured backend request logging with request IDs.
- Typed API error responses and centralized error middleware.

Out of scope for this delivery:

- Password reset.
- Admin-user management UI.
- Public student access.
- RBAC or multiple admin roles.
- Student lifecycle workflows, status transition rules, restore, hard delete, audit history, or scheduled jobs.
- Production legal policy, retention automation, backup/restore runbook, and deployment automation.

The main AI tool used for implementation work is Codex.
