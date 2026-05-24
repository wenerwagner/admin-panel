---
title: API Documentation and OpenAPI Strategy
type: architecture
status: draft
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [api, documentation, openapi, swagger, backend]
area: admin-panel
related:
  - ADR-001 - Application Architecture and Technology Stack
  - ADR-004 - REST API Design and Naming Conventions
  - ADR-008 - Application Error Handling Strategy
---

# ADR-006 - API Documentation and OpenAPI Strategy

* **Status:** Draft
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

ADR-001 selects an Express REST API consumed by the React SPA. ADR-004 defines the initial REST endpoints, naming
conventions, response shapes, pagination, validation boundary, and error shape.

The API is private to this application in v1, but it still needs clear documentation so frontend implementation,
backend implementation, and tests share the same contract.

The project needs to decide whether OpenAPI documentation is required, whether Swagger UI should be exposed, and how
the documentation should be maintained without adding unnecessary framework complexity.

## Considered Options

Chosen option: **Maintained OpenAPI specification file with local Swagger UI only**.

1. **Maintained OpenAPI specification file with local Swagger UI only** *(chosen)*
   * *Pros:* Keeps the API contract explicit, simple to review, and independent from Express tooling limitations.
   * *Cons:* Requires discipline to keep the specification aligned with routes and tests.

2. **Generate OpenAPI from Express/Zod code**
   * *Pros:* Can reduce duplication between validation schemas and documentation.
   * *Cons:* Adds tooling complexity and may constrain route/schema design for a small API.

3. **No OpenAPI documentation in v1**
   * *Pros:* Minimal upfront work.
   * *Cons:* Leaves the frontend/backend API contract scattered across ADR text, code, and tests.

4. **Public Swagger UI in production**
   * *Pros:* Makes the API easy to inspect from a deployed environment.
   * *Cons:* Adds unnecessary exposure for an internal admin API that handles PII.

## Decision

The project will maintain an OpenAPI specification file in the repository for the v1 API.

The OpenAPI file is the human-reviewed API documentation contract. It should describe:

* auth endpoints
* student endpoints
* request bodies
* query parameters
* route parameters
* response bodies
* pagination shape
* authentication and CSRF requirements
* shared error response schema
* endpoint-specific HTTP status codes

The backend will continue to use Zod schemas at the HTTP boundary for runtime validation. The OpenAPI specification
will not be generated from Express routes or Zod schemas in v1.

Swagger UI may be served by the backend in local/development environments, for example at:

```text
/api/docs
```

Swagger UI must not be publicly exposed in production in v1. The raw OpenAPI specification should also not be exposed
in production unless explicitly configured for a controlled environment.

The OpenAPI specification should use shared reusable schemas for standard error responses instead of repeating full
error bodies on every endpoint. Each endpoint should list the status codes it can return and reference the shared error
schema.

The shared error schema must align with ADR-004 and ADR-008:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": []
  }
}
```

## Consequences

### Positive

* The API contract is explicit before and during implementation.
* Frontend and backend work can align around one documented contract.
* Swagger UI remains useful locally without exposing internal API details publicly.
* The project avoids extra code-generation complexity in v1.
* Shared error schemas reduce documentation duplication.

### Negative / Trade-offs

* The OpenAPI specification can drift from code if not reviewed and tested.
* Request/response TypeScript types are still maintained separately in v1.
* Some duplication remains between ADRs, OpenAPI, Zod schemas, and tests.

## Deferred Decisions

* Generating OpenAPI from code.
* Generating frontend TypeScript API types from OpenAPI.
* Publishing API documentation for external consumers.
* Exposing Swagger UI in controlled non-local environments.
* Automated contract tests that validate every route response against OpenAPI.

## References

* [ADR-001 - Application Architecture and Technology Stack](ADR-001-application-architecture-and-technology-stack.md)
* [ADR-004 - REST API Design and Naming Conventions](ADR-004-rest-api-design-and-naming-conventions.md)
* [ADR-008 - Application Error Handling Strategy](ADR-008-application-error-handling-strategy.md)
