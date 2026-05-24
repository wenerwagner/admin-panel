# Architecture

This document records the current accepted architecture decisions for the Escola do Breno administrative student
management panel. Detailed rationale, alternatives, and consequences live in the ADRs under [docs/adr](adr/).

## Decision Status

The v1 architecture baseline is accepted. Implementation issues should be created from these decisions unless a new
constraint appears during development.

Open legal, retention, and production operations questions are tracked separately in [open questions](open-questions.md).
Those questions must be resolved before real production use with real student data, but they do not block local
development or evaluation of the v1 application.

## Product Shape

The application is a focused internal CRUD backoffice for administrators to manage student records. It intentionally
does not include student lifecycle workflows, status transition rules, scheduled jobs, audit history, or complex
business processes.

The v1 functional scope is:

- admin login
- list students
- create students
- edit students
- delete students
- optional search and filtering in the student list

## Application Architecture

The application uses a simple containerized three-layer architecture:

- **Frontend:** React single-page application built with Vite and TypeScript.
- **Backend:** Express REST API written in TypeScript.
- **Database:** PostgreSQL accessed only by the backend through Prisma.

The frontend communicates with the backend only through the REST API. The backend is the only application layer that
connects to PostgreSQL, and Prisma migrations manage schema changes.

The repository uses a lightweight monorepo layout:

```text
apps/
  web/
  api/
docker-compose.yml
docs/
```

Shared internal packages are intentionally avoided in v1. They should be introduced only when repeated code or shared
contracts justify the extra structure.

## Technology Summary

The accepted v1 technology stack is:

- **Language and runtime:** TypeScript for frontend and backend; Node.js for the backend runtime.
- **Frontend:** React, Vite, TanStack Query, React Hook Form, and Zod.
- **Backend API:** Express, REST, Zod request validation, centralized Express error middleware, and Node's built-in
  `crypto.randomBytes` for high-entropy session token generation.
- **Authentication and security:** `argon2` password hashing, PostgreSQL-backed opaque sessions, HTTP-only cookies,
  CSRF tokens sent with `X-CSRF-Token`, application-level login rate limiting, explicit CORS configuration, and
  configured reverse-proxy trust only behind Caddy or another known proxy.
- **Database and persistence:** PostgreSQL, Prisma, Prisma migrations, and raw SQL migrations where PostgreSQL partial
  unique indexes require support beyond Prisma schema capabilities.
- **API documentation:** Human-reviewed OpenAPI specification and local-only Swagger UI.
- **Logging:** `pino` structured logging with explicit redaction and serializers; `pino-pretty` or equivalent may be
  used for local human-readable logs.
- **Testing:** Vitest, Supertest, a real disposable PostgreSQL test database, and Prisma.
- **Deployment:** Docker Compose, Caddy, containerized frontend/backend/PostgreSQL services, and a persistent Docker
  volume for PostgreSQL.

## Deployment Model

Docker Compose is the local development, evaluation, and initial deployment model. The full application must run with:

```sh
docker compose up
```

The initial deployment runs the frontend, backend, and PostgreSQL as containerized services on a single host.
PostgreSQL uses a persistent Docker volume.

The React application is built as static assets and served by Caddy. Caddy may also reverse proxy `/api` requests to the
backend so the deployed application can use a single public web origin.

The exact production host/provider, backup procedures, restore procedures, incident response, and retention operations
are not yet accepted decisions.

## Authentication and Authorization

Admin users are stored in PostgreSQL. There is no public registration endpoint in v1.

Admins authenticate with email and password. Passwords are hashed with Argon2. Email addresses are trimmed, lowercased,
required, and unique.

Authenticated browser sessions use PostgreSQL-backed opaque session tokens in HTTP-only cookies:

- raw session tokens are sent only to the browser cookie
- only token hashes are stored in the database
- sessions have an 8-hour absolute lifetime
- logout revokes the current session
- inactive admins cannot log in or keep using existing sessions

Authorization is single-role in v1. Any active authenticated admin can perform all student CRUD operations. RBAC,
password reset, admin-user management, and external identity providers are deferred.

Cookie-based sessions require CSRF protection for authenticated state-changing requests. The SPA sends the CSRF token in
the `X-CSRF-Token` header. Login is exempt from CSRF protection but remains rate-limited.

The Express backend trusts reverse proxy headers only when explicitly configured for Caddy or another known proxy. The
API is same-origin only in production: CORS is disabled or restricted there, while local development may allow the Vite
dev server origin through environment configuration.

Backend environment configuration is explicit and validated at startup with Zod.

## Student Domain Model

The v1 domain has three core entities:

- `AdminUser`
- `Session`
- `Student`

Student records contain:

- `name`
- `email`
- `cpf`
- `phone`
- `subscribedPlan`
- `status`
- timestamps
- `deletedAt` for soft delete

All product-defined student fields are required on create.

Student email and CPF are unique among non-deleted students. Because student deletion is soft delete, active uniqueness
must be enforced with PostgreSQL partial unique indexes.

The accepted enum values are:

```text
subscribedPlan: basic, premium
status: active, paused, canceled
```

Student status is descriptive only. There are no transition rules or restrictions such as "canceled students cannot be
edited."

CPF is stored as digits only after server-side validation. Phone numbers are stored as E.164-style strings. Email is
stored lowercased and trimmed.

## REST API Contract

The backend exposes a private REST API under `/api`. There is no `/v1` URL prefix in v1 because the frontend and backend
are deployed together and the API is not a public third-party contract.

Accepted auth endpoints:

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Accepted student endpoints:

```text
GET    /api/students
POST   /api/students
GET    /api/students/:studentId
PATCH  /api/students/:studentId
DELETE /api/students/:studentId
```

Student listing supports:

```text
q
status
subscribedPlan
page
pageSize
```

Pagination uses `page` and `pageSize`, defaults to `page=1` and `pageSize=20`, and caps `pageSize` at `100`.

Single-resource responses return the resource directly. Collection responses use an envelope with `data`, `page`,
`pageSize`, `total`, and `totalPages`.

All API errors use the standardized JSON error shape with stable uppercase snake-case error codes.

## PII and LGPD Controls

The application treats student name, email, CPF, phone, subscribed plan, and status as personal data. CPF receives
heightened care as a strong Brazilian identifier.

The v1 engineering controls are:

- active-admin-only access to student data
- no public student endpoints
- HTTP-only session cookies
- CSRF protection for state-changing requests
- same-origin production access
- HTTPS in production
- server-side validation and normalization
- masked PII in list responses
- full formatted PII only in detail/create/update responses
- no request or response body logging by default
- explicit log redaction
- database not publicly exposed
- backups treated as sensitive data

v1 does not include application-level field encryption, in-app LGPD request workflows, automated purge, anonymization
jobs, or full audit logging.

## API Documentation

The project maintains a human-reviewed OpenAPI specification file in the repository for the v1 API contract. The OpenAPI
file documents endpoints, schemas, parameters, response bodies, authentication, CSRF requirements, and error responses.

OpenAPI is not generated from Express routes or Zod schemas in v1.

Swagger UI may be exposed locally at `/api/docs`, but Swagger UI and the raw OpenAPI specification must not be publicly
exposed in production unless a later decision explicitly allows it.

## Logging and Error Handling

The backend uses structured logging with `pino`.

Production logs are JSON logs written to stdout/stderr. Local development may use pretty logging while preserving the
same redaction behavior.

Every HTTP request has a request ID. The response includes the request ID in `X-Request-Id`, and unexpected `500` errors
may include that ID in the response body.

Logs must include useful operational metadata such as method, route template, status code, duration, and request ID.
Logs must not include request bodies, response bodies, cookies, auth/session headers, CSRF tokens, passwords, CPF, phone,
email, name, or raw search query values.

Expected backend failures use typed application errors and centralized Express error middleware. Raw framework,
Prisma, SQL, stack trace, and validation-library details are not returned to clients.

The frontend maps API error codes to safe user-facing behavior in one centralized error-message utility.

## Testing Strategy

The v1 test strategy is backend-focused because the highest-risk behavior is authorization, validation, sessions, CSRF,
database uniqueness, soft delete, and PII exposure.

Required backend/API tests use:

```text
Vitest
Supertest
real PostgreSQL test database
Prisma
```

Required coverage includes:

- login success and failure
- logout session revocation
- `GET /api/auth/me` requiring a valid session
- inactive admin rejection
- unauthenticated student endpoint rejection
- CSRF enforcement
- student field validation
- CPF, email, and phone normalization and validation
- duplicate active CPF/email conflict behavior
- list response PII masking
- detail/create/update full PII response behavior
- soft-deleted student exclusion
- deleted student uniqueness behavior
- API error shape and stable error codes
- absence of submitted sensitive values in tested log paths where practical

Frontend component tests and browser end-to-end tests are optional in v1. Manual UI verification is acceptable for the
technical-test scope.

## Backend Structure

The backend uses a technical-layer Express structure:

```text
apps/api/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    config/
    controllers/
    errors/
    lib/
    middleware/
    repositories/
    routes/
    schemas/
    services/
    utils/
    app.ts
    server.ts
  tests/
    integration/
    unit/
```

Controllers are thin HTTP adapters. Services own application rules. Repositories own Prisma queries. Routes own Express
route registration and middleware composition. Zod schemas live at the HTTP boundary.

`app.ts` creates the Express app without starting the listener. `server.ts` starts the HTTP server. This supports
Supertest integration tests.

## Frontend Structure

The frontend uses a technical-layer React structure:

```text
apps/web/
  src/
    api/
    components/
    hooks/
    pages/
    routes/
    styles/
    types/
    utils/
    main.tsx
```

The frontend uses TanStack Query for server state and React Hook Form with Zod for client-side form validation.
Backend validation remains authoritative.

The frontend maintains API request and response TypeScript types manually in v1. Generating frontend types from OpenAPI
is deferred.

## Accepted ADRs

- [ADR-001 - Application Architecture and Technology Stack](adr/ADR-001-application-architecture-and-technology-stack.md)
- [ADR-002 - Authentication and Authorization Strategy](adr/ADR-002-authentication-and-authorization-strategy.md)
- [ADR-003 - Student Domain Model and Entity Definitions](adr/ADR-003-student-domain-model-and-entity-definitions.md)
- [ADR-004 - REST API Design and Naming Conventions](adr/ADR-004-rest-api-design-and-naming-conventions.md)
- [ADR-005 - PII and LGPD Compliance Controls](adr/ADR-005-pii-and-lgpd-compliance-controls.md)
- [ADR-006 - API Documentation and OpenAPI Strategy](adr/ADR-006-api-documentation-and-openapi-strategy.md)
- [ADR-007 - Backend Logging and Observability Strategy](adr/ADR-007-backend-logging-and-observability-strategy.md)
- [ADR-008 - Application Error Handling Strategy](adr/ADR-008-application-error-handling-strategy.md)
- [ADR-009 - Testing Strategy](adr/ADR-009-testing-strategy.md)
- [ADR-010 - Backend Folder Structure and Module Architecture](adr/ADR-010-backend-folder-structure-and-module-architecture.md)
- [ADR-011 - Frontend Folder Structure and UI Architecture](adr/ADR-011-frontend-folder-structure-and-ui-architecture.md)
