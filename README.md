# Admin Panel

Administrative student management panel for Escola do Breno.

## One-Command Setup

Prerequisite: Docker with Docker Compose.

```sh
docker compose up
```

This boots the full local stack from scratch: PostgreSQL, database migrations, local admin seed, demo student seed, API,
and the Caddy-served web app.

Open the app at `http://localhost:8080`.

## Admin Access

`docker compose up` automatically creates the local admin account:

```text
Email: admin@example.com
Password: local-admin-password
```

To override the local seed, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` in `.env`.

To create an admin manually outside the Compose bootstrap:

```sh
npm run admin:create --workspace apps/api -- --email admin@example.com --password local-admin-password --name "Local Admin"
```

## API Documentation

Swagger UI is available in local development at `http://localhost:8080/api/docs/`.

The OpenAPI YAML is available at `http://localhost:8080/api/docs/openapi.yaml`.

## Delivered Scope

Completed must-have items:

- Admin login with PostgreSQL-backed HTTP-only cookie sessions.
- Complete student CRUD: list, add, edit, and soft delete.
- Server-side validation for CPF, email, and Brazilian phone numbers.
- Tests for validation, authentication, authorization, and student API behavior.
- `docker compose up` bootstraps the app from scratch.
- README, `CONTEXT.md`, and accepted ADRs in `docs/adr/`.

Completed nice-to-have items:

- Student search and filters by status and subscribed plan.
- Soft delete for students, with architecture/modeling rationale in ADRs.
- API tests with Vitest, Supertest, Prisma, and PostgreSQL.
- Additional ADRs covering architecture, auth, API conventions, PII controls, OpenAPI, logging, errors, testing, and
  folder structure.
- Swagger/OpenAPI documentation for the REST API.
- GitHub Actions quality gate.

Out of scope:

- Audit log or edit history.
- Business rules for student status transitions, such as "cannot edit canceled students."
- Triggers, jobs, or scheduled workflows.
- State machines.
- Fancy UI, branding, or polished visual design.
- Password reset, admin-user management UI, public student access, RBAC, and production operations automation.

## Project Docs

- `CONTEXT.md`: short project orientation, stable domain context, v1 scope, vocabulary, and modeling notes.
- `docs/product.md`: product requirements, scope, glossary, constraints, and out-of-scope items.
- `docs/architecture.md`: summary of accepted architecture decisions.
- `docs/adr/`: Architecture Decision Records. New ADRs should use `docs/adr/ADR-000-template.md`.
- `docs/engineering.md`: repository workflow, branching, PR expectations, commands, checks, and testing process.
- `docs/open-questions.md`: deferred decisions and unresolved production questions.

## Primary AI Tool

The primary AI tool used for implementation work was Codex.
