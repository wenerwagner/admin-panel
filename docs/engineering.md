# Engineering

## Purpose

This document defines the development process for this repository. The project is intentionally simple, so the process
should show clear engineering discipline without adding unnecessary ceremony.

Architectural decisions belong in ADRs. Unresolved or intentionally deferred decisions belong in
[open questions](open-questions.md). Concrete implementation tasks are tracked in
[GitHub Issues](https://github.com/wenerwagner/admin-panel/issues).

## Repository Workflow

`main` is the only long-lived branch. It should remain buildable and ready to release.

Work should happen in short-lived branches created from `main`. Suggested branch names are descriptive and scoped, for
example:

```text
feat/student-list
fix/login-session
docs/engineering-process
```

The project should not use permanent `develop`, `staging`, or `release/*` branches while the repository remains small.
If the project grows enough to require a more formal release flow, that decision should be recorded before changing the
branching model.

## Branching

Required branches:

* `main`

Allowed temporary branches:

* `feat/*`
* `fix/*`
* `docs/*`
* `chore/*`

Temporary branches should be deleted after merge.

## Pull Requests and Reviews

Pull requests are preferred for changes to `main`.

Small direct commits to `main` are acceptable only for documentation-only or setup work before CI exists. Once CI exists,
changes should go through pull requests unless there is a clear reason not to.

Each pull request should include:

* a short summary of the change
* tests or checks performed
* documentation updates, when behavior or commands changed
* deferred decisions added to [open questions](open-questions.md), when applicable

Behavior changes should update related docs or issue descriptions when the change affects documented expectations.

Squash merge is the preferred merge style for this repository because it keeps `main` readable.

## Commits

Commit messages should be imperative and concise.

Examples:

```text
Add student list endpoint
Document engineering process
Fix session expiration handling
```

Conventional Commit prefixes such as `docs:` or `fix:` are allowed but not required.

## Work Tracking

GitHub Issues is the active tracker for implementation work.

The local `issues/` directory was removed after its drafts were migrated. New implementation work should be opened in
GitHub Issues, not added as local issue draft files.

Issue implementation should happen in a short-lived branch created from up-to-date `main`. If an issue number is known,
include it in the branch name when practical, for example:

```text
feat/issue-12-student-list
fix/issue-18-login-session
docs/issue-21-engineering-process
```

Pull requests for issue work should use [.github/pull_request_template.md](../.github/pull_request_template.md) and
link the issue with `Refs #N` by default. Use automatic-closing keywords such as `Closes #N`, `Fixes #N`, or
`Resolves #N` only when automatic issue closure after merge is intended.

Issue and PR labels, assignees, milestones, project fields, and closure state are part of project triage and should be
changed intentionally.

## Deferred Decisions

Any known decision that is intentionally postponed must be recorded in [open questions](open-questions.md). Do not leave
unresolved decisions only in commit messages, pull request descriptions, local issue files, or chat history.

Each deferred entry should include:

* status
* date
* owner
* context
* question or recommendation
* decision needed before

Use `Open` for unresolved decisions, `Deferred` for intentionally postponed recommendations, and `Answered` once a final
answer is known.

## Versioning and Tags

The project uses simple semantic version tags:

* `v0.x.0` for development milestones
* `v1.0.0` for the first complete deliverable
* `v1.0.x` for fixes after `v1.0.0`

Release notes may be written manually from merged pull requests and the release checklist. Automated changelog generation
is not required.

## Local Development

Install dependencies from the repository root:

```sh
npm install
```

The root workspace scripts run the matching script in each workspace when present:

```sh
npm run build
npm run dev
npm run lint
npm test
npm run typecheck
```

`npm run lint` currently runs placeholder workspace scripts. Real lint tooling is not implemented yet.

### API Commands

Implemented API commands:

```sh
npm run build --workspace apps/api
npm test --workspace apps/api
npm run typecheck --workspace apps/api
npm run dev --workspace apps/api
npm run prisma:generate --workspace apps/api
npm run prisma:migrate --workspace apps/api
npm run prisma:validate --workspace apps/api
npm run admin:create --workspace apps/api -- --email admin@example.com --password local-admin-password --name "Local Admin"
npm run seed --workspace apps/api
```

`npm run dev --workspace apps/api` starts the Express API on port `3000` by default. Set `PORT` to use a different
local port.

`npm test --workspace apps/api` runs Vitest API tests against real PostgreSQL. Start the local database first with
`docker compose up postgres`. By default, the test harness uses
`postgres://admin_panel:admin_panel_password@localhost:5432/admin_panel?schema=test`, applies Prisma migrations to that
schema, and resets application tables before each test. Set `TEST_DATABASE_URL` to use a different disposable
PostgreSQL database or schema.

The API validates required environment variables at startup. Local Docker Compose defaults are documented in
[`.env.example`](../.env.example). Production must provide explicit secrets and must set `SESSION_COOKIE_SECURE=true`.

`npm run prisma:migrate --workspace apps/api` runs Prisma `migrate dev` against the configured database. Use it for
local development after PostgreSQL is running. Production-style migration execution should use Prisma `migrate deploy`
against an explicitly configured database; the final production migration procedure is still deferred until the
deployment target is selected.

`npm run admin:create --workspace apps/api -- --email ... --password ... --name ...` creates an admin intentionally.
It fails if the email already exists and does not overwrite the stored password. `npm run seed --workspace apps/api`
uses the same implementation and may read `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from the environment.

### Web Commands

Implemented web commands:

```sh
npm run build --workspace apps/web
npm test --workspace apps/web
npm run typecheck --workspace apps/web
npm run dev --workspace apps/web
```

`npm run dev --workspace apps/web` starts the Vite dev server on port `5173` by default.

### Docker Compose Commands

```sh
docker compose config
docker compose up --build
docker compose up postgres
docker compose down
docker compose down -v
```

The Compose stack starts PostgreSQL, the API, and the Caddy-served web app. By default the API is available at
`http://localhost:3000`, the web app is available at `http://localhost:8080`, and Caddy proxies `/api/*` to the API.

For a clean local database, start PostgreSQL and run migrations before creating an admin:

```sh
docker compose up postgres
npm run prisma:migrate --workspace apps/api
npm run admin:create --workspace apps/api -- --email admin@example.com --password local-admin-password --name "Local Admin"
```

Then start the full stack:

```sh
docker compose up --build
```

`docker compose down -v` removes the local PostgreSQL volume and should be used only when intentionally resetting local
development data.

The README should contain the shortest setup path for a clean checkout. This document should contain the broader
engineering workflow and command reference.

## Quality Gate

Before merging code into `main`, the following checks should pass:

```sh
npm run prisma:generate --workspace apps/api
npm run lint
npm run typecheck
npm test --workspace apps/api
npm test --workspace apps/web
npm run build
docker compose config
```

GitHub Actions runs the same quality gate on pull requests and pushes to `main`. The CI workflow provisions a disposable
PostgreSQL database for API tests and passes it through `TEST_DATABASE_URL`.

Run `npm run lint` once real lint tooling replaces the current placeholder scripts.

Schema changes must include committed Prisma migrations.

Coverage percentage thresholds are not required for v1.

## Testing

The testing strategy is defined in [ADR-009](adr/ADR-009-testing-strategy.md). For v1, the highest priority is backend
and API behavior around authentication, authorization, validation, persistence, and PII handling.

Frontend tests are optional in v1 unless a focused test protects behavior that would otherwise be risky to verify.
End-to-end browser tests are not required in v1. A manual happy-path check is sufficient before release.

## Database Migrations

Database schema changes must be made through Prisma migrations.

Rules:

* schema changes must include committed migrations
* migrations are reviewed like application code
* shared or merged migrations should not be edited after other developers or environments may have applied them
* local reset, seed, and test database commands must be documented once implemented

The production migration procedure is deferred until the production deployment target is defined.

Implemented local migration command:

```sh
npm run prisma:migrate --workspace apps/api
```

Production-style migration deployment command, to be run from `apps/api` with explicit production environment:

```sh
npx prisma migrate deploy --schema prisma/schema.prisma
```

Local database reset command:

```sh
docker compose down -v
```

After resetting, start PostgreSQL again, rerun migrations, and recreate the local admin.

## Environment Variables and Secrets

The project should maintain `.env.example` files once environment variables exist.

Rules:

* never commit real secrets
* local development may use safe example defaults
* production secrets must be generated and provided outside Git
* required variables should be documented near the app that consumes them and summarized here
* CI secrets must live in the CI provider's secret store

Current local Docker Compose variables:

```text
API_PORT
WEB_PORT
POSTGRES_PORT
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_DB
```

Current API variables:

```text
NODE_ENV
PORT
DATABASE_URL
SESSION_COOKIE_NAME
SESSION_COOKIE_SECURE
SESSION_TTL_HOURS
CSRF_SECRET
CORS_ALLOWED_ORIGINS
TRUST_PROXY
LOG_LEVEL
```

Current admin seed/create variables:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_NAME
```

Current test override variable:

```text
TEST_DATABASE_URL
```

Unresolved production secret handling decisions must be tracked in [open questions](open-questions.md).

## CI/CD

GitHub Actions is the intended CI provider.

CI is implemented in `.github/workflows/ci.yml` and runs on pull requests and pushes to `main`.

The CI workflow runs the merge quality gate:

* lint or format check
* typecheck
* tests
* build
* Docker Compose validation

Deployment automation is intentionally deferred. CI should validate the project before `main` is changed, but it should
not deploy to production until the production target, secrets strategy, and deployment procedure are defined.

CI/CD does not require a dedicated ADR for this project unless the deployment model becomes more complex.

## Deployment

The current deployment stance is intentionally minimal.

Docker Compose is the expected deployment shape, consistent with
[ADR-001](adr/ADR-001-application-architecture-and-technology-stack.md). Automated deployment is not defined yet.

The production target, domain and HTTPS procedure, backup and restore procedure, incident response process, and detailed
production migration flow remain deferred decisions tracked in [open questions](open-questions.md).

## Release Checklist

Before creating a release tag:

* `main` is up to date
* the quality gate passes
* README setup instructions are current
* engineering docs list the actual implemented commands
* open questions do not block the release
* migrations are committed if the schema changed
* the manual happy-path check is completed
* create a semantic version tag such as `v1.0.0`
* add short release notes
