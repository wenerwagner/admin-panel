---
title: Frontend Folder Structure and UI Architecture
type: architecture
status: accepted
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [frontend, architecture, folder-structure, react, forms]
area: admin-panel
related:
  - ADR-001 - Application Architecture and Technology Stack
  - ADR-004 - REST API Design and Naming Conventions
  - ADR-006 - API Documentation and OpenAPI Strategy
  - ADR-008 - Application Error Handling Strategy
---

# ADR-011 - Frontend Folder Structure and UI Architecture

* **Status:** Accepted
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

ADR-001 selects a React single-page application built with Vite and TypeScript. The frontend consumes the backend REST
API and does not access PostgreSQL directly.

The frontend scope is intentionally small: login, authenticated student list, create student, edit student, and delete
student. The folder structure and client-side libraries should support these flows without creating unnecessary
architecture.

## Considered Options

Chosen option: **Technical-layer frontend structure with focused server-state and form libraries**.

1. **Technical-layer frontend structure with focused server-state and form libraries** *(chosen)*
   * *Pros:* Simple, predictable, and aligned with the small v1 UI scope.
   * *Cons:* Domain-specific files are spread across folders such as `api`, `components`, `hooks`, and `pages`.

2. **Feature/domain-module frontend structure**
   * *Pros:* Keeps all files for auth or students close together.
   * *Cons:* Adds folder nesting before the frontend has enough features to need it.

3. **Minimal components-only structure with direct fetch calls**
   * *Pros:* Very small initial setup.
   * *Cons:* Can duplicate loading, error, cache invalidation, and form behavior across pages.

## Decision

The frontend will use a technical-layer layout with domain naming inside files.

The target structure is:

```text
apps/web/
  src/
    api/
      client.ts
      auth-api.ts
      student-api.ts
    components/
      layout/
      ui/
      student-form.tsx
      student-table.tsx
    hooks/
      use-auth.ts
      use-students.ts
    pages/
      login-page.tsx
      students-page.tsx
      student-new-page.tsx
      student-edit-page.tsx
    routes/
      router.tsx
      protected-route.tsx
    styles/
      index.css
    types/
      api.ts
    utils/
      error-messages.ts
      formatters.ts
    main.tsx
```

The frontend will maintain TypeScript API request/response types manually in v1, likely under `src/types/api.ts`.
Generating TypeScript types from OpenAPI is deferred.

The frontend will use TanStack Query for server state:

* fetching the current admin
* fetching student lists and details
* create/update/delete mutations
* loading and error state
* cache invalidation after mutations

TanStack Query will not be used as general global application state.

Authentication state will be represented through a small `useAuth` wrapper around `GET /api/auth/me` and login/logout
mutations.

Forms will use React Hook Form with Zod for client-side validation. Backend validation remains authoritative. Frontend
validation exists to provide faster feedback and reduce avoidable invalid submissions.

Frontend error handling must follow ADR-008. API error codes should be mapped to safe user-facing messages in a
centralized utility such as `utils/error-messages.ts`.

The frontend must not log PII. Frontend logging in v1 is console-only and should be minimal.

## Consequences

### Positive

* The structure is small and easy to navigate.
* Server-state behavior is consistent across list/detail/mutation flows.
* Form validation is predictable without making frontend validation authoritative.
* Error message mapping is centralized instead of scattered across components.
* The project avoids OpenAPI type-generation complexity in v1.

### Negative / Trade-offs

* Manual API types can drift from the OpenAPI spec and backend schemas.
* TanStack Query and React Hook Form add dependencies.
* Domain-specific frontend files are spread across technical folders.
* Without required frontend tests, UI regressions rely more on manual review in v1.

## Deferred Decisions

* Generating frontend API types from OpenAPI.
* Required frontend component testing.
* End-to-end browser testing.
* Global client state library beyond TanStack Query.
* Design system or component library selection.
* Feature/domain-module migration if the frontend grows.

## References

* [ADR-001 - Application Architecture and Technology Stack](ADR-001-application-architecture-and-technology-stack.md)
* [ADR-004 - REST API Design and Naming Conventions](ADR-004-rest-api-design-and-naming-conventions.md)
* [ADR-006 - API Documentation and OpenAPI Strategy](ADR-006-api-documentation-and-openapi-strategy.md)
* [ADR-008 - Application Error Handling Strategy](ADR-008-application-error-handling-strategy.md)
