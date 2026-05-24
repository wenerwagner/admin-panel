---
title: Backend Folder Structure and Module Architecture
type: architecture
status: draft
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [backend, architecture, folder-structure, express, prisma]
area: admin-panel
related:
  - ADR-001 - Application Architecture and Technology Stack
  - ADR-007 - Backend Logging and Observability Strategy
  - ADR-008 - Application Error Handling Strategy
  - ADR-009 - Testing Strategy
---

# ADR-010 - Backend Folder Structure and Module Architecture

* **Status:** Draft
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

ADR-001 selects a TypeScript Express backend with Prisma and PostgreSQL. The repository has a top-level monorepo target
layout, but the internal backend structure is not yet defined.

The backend is expected to remain small in v1, with authentication, sessions, student CRUD, validation, error handling,
logging, and PII protection. The structure should make these responsibilities easy to find without adding unnecessary
nesting.

## Considered Options

Chosen option: **Technical-layer backend structure**.

1. **Technical-layer backend structure** *(chosen)*
   * *Pros:* Simple, familiar for Express apps, and clear for a small backend with few resources.
   * *Cons:* Related files for one domain are spread across multiple folders.

2. **Feature/domain-module backend structure**
   * *Pros:* Keeps routes, schemas, services, repositories, and tests for a domain close together.
   * *Cons:* Can feel heavier than needed for a small auth-and-students API.

3. **Flat route-handler structure**
   * *Pros:* Minimal initial ceremony.
   * *Cons:* Encourages mixing HTTP handling, validation, business rules, and database access.

## Decision

The backend will use a technical-layer layout.

This is a good fit for v1 because:

* The backend is small: auth, students, and shared infrastructure.
* Express applications naturally separate routes, controllers, middleware, services, and repositories.
* Folder names describe technical roles clearly for maintainers.
* HTTP concerns stay separate from application rules and database access.
* The structure avoids deep per-module nesting before the domain needs it.
* Domain naming remains clear through filenames such as `student.controller.ts` and `auth.service.ts`.
* The project can migrate to feature modules later if the codebase grows enough to justify it.

The backend target structure is:

```text
apps/api/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  src/
    config/
      env.ts
    controllers/
      auth.controller.ts
      student.controller.ts
    errors/
      app-error.ts
      error-codes.ts
      error-middleware.ts
      validation-error.ts
    lib/
      argon2.ts
      csrf.ts
      logger.ts
      prisma.ts
      request-id.ts
    middleware/
      auth.middleware.ts
      csrf.middleware.ts
      rate-limit.middleware.ts
      request-logging.middleware.ts
    repositories/
      admin-user.repository.ts
      session.repository.ts
      student.repository.ts
    routes/
      auth.routes.ts
      student.routes.ts
      index.ts
    schemas/
      auth.schema.ts
      student.schema.ts
    services/
      auth.service.ts
      student.service.ts
    utils/
      cpf.ts
      mask-pii.ts
      phone.ts
    app.ts
    server.ts
  tests/
    integration/
    unit/
```

Controllers are thin HTTP adapters. They parse request context, call services, and return responses.

Services own application rules and orchestrate work. They may call repositories and helpers, and they throw typed
application errors as defined in ADR-008.

Repositories own Prisma queries and database persistence details. Controllers must not call Prisma directly.

Routes own Express route registration and middleware composition.

Schemas own request validation definitions. Zod schemas live in the shared `schemas/` layer, grouped by resource, such
as `auth.schema.ts` and `student.schema.ts`.

Middleware owns cross-cutting HTTP behavior such as authentication, CSRF, rate limiting, request IDs, and request
logging.

`app.ts` creates and configures the Express application without starting the network listener. `server.ts` starts the
HTTP server. This separation supports Supertest integration tests.

## Consequences

### Positive

* The structure is easy to understand for a small Express backend.
* HTTP handling, business rules, and database access have clear boundaries.
* Tests can import the Express app without starting a server.
* Zod schemas and helper utilities are easy to test directly.
* The layout leaves room for future migration to feature modules if needed.

### Negative / Trade-offs

* Working on one resource may require touching files in several folders.
* Technical-layer layouts can become crowded if the number of domains grows.
* Developers must maintain the controller/service/repository boundary deliberately.

## Deferred Decisions

* Migration to feature/domain modules if the backend grows.
* Shared internal packages across `apps/api` and `apps/web`.
* Background job structure.
* Admin CLI command structure beyond initial seed/create-admin needs.

## References

* [ADR-001 - Application Architecture and Technology Stack](ADR-001-application-architecture-and-technology-stack.md)
* [ADR-007 - Backend Logging and Observability Strategy](ADR-007-backend-logging-and-observability-strategy.md)
* [ADR-008 - Application Error Handling Strategy](ADR-008-application-error-handling-strategy.md)
* [ADR-009 - Testing Strategy](ADR-009-testing-strategy.md)
