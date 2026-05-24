---
title: REST API Design and Naming Conventions
type: architecture
status: draft
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [api, rest, naming, validation, testing]
area: admin-panel
related:
  - ADR-001 - Application Architecture and Technology Stack
  - ADR-002 - Authentication and Authorization Strategy
  - ADR-003 - Student Domain Model and Entity Definitions
  - ADR-005 - PII and LGPD Compliance Controls
---

# ADR-004 - REST API Design and Naming Conventions

* **Status:** Draft
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

ADR-001 selected an Express REST API consumed by a React SPA. The API is private to this application and is not intended
as a public third-party integration contract in v1.

ADR-002 defines authentication and authorization requirements. ADR-003 defines the entity model. ADR-005 defines PII
exposure rules that directly affect response shapes.

The API design needs to be explicit before implementation so frontend behavior, validation, tests, and backend routes
can be built consistently.

## Considered Options

Chosen options: **Private REST API without URL versioning**, **Direct single-resource responses with collection envelopes**, and **Page/pageSize pagination**.

1. **Private REST API without URL versioning** *(chosen)*
   * *Pros:* Keeps routes simple and matches the same-repo, same-deployment frontend/backend model.
   * *Cons:* Would need a later migration if the API becomes externally consumed.

2. **URL versioned API from v1**
   * *Pros:* Makes future compatibility boundaries visible immediately.
   * *Cons:* Adds noise before there is a public or independently versioned API contract.

3. **Direct single-resource responses with collection envelopes** *(chosen)*
   * *Pros:* Keeps simple responses simple while supporting pagination metadata.
   * *Cons:* Response shape differs between single-resource and collection endpoints.

4. **Universal response envelope**
   * *Pros:* Uniform response shape across all endpoints.
   * *Cons:* Adds ceremony without meaningful benefit for this small internal API.

5. **Page/pageSize pagination** *(chosen)*
   * *Pros:* Simple for admin tables, easy to test, and aligns with the expected backoffice dataset size.
   * *Cons:* May need replacement if the dataset becomes large or frequently changes while admins are paging.

6. **Cursor pagination**
   * *Pros:* Better for large or frequently changing datasets.
   * *Cons:* Unnecessary complexity for the current backoffice use case.

## Decision

The API will use resource-oriented REST endpoints under the `/api` prefix.

There will be no explicit `/v1` URL version in v1. The API is private to the same monorepo SPA/backend, deployed
together, and not consumed by third parties. Versioning is deferred until there is an independent compatibility contract,
external consumer, or separate frontend/backend deployment cadence. If versioning is introduced later, it must be done by
ADR, likely with a prefix such as `/api/v1`.

Naming conventions:

* Base prefix: `/api`
* Resource paths: plural nouns
* Path segments: lowercase kebab-case when multiple words are needed
* Route params: semantic camelCase names in docs and code, such as `:studentId`
* JSON fields: camelCase
* JSON enum values: lowercase strings
* Timestamps: ISO 8601 strings
* No trailing slash on canonical endpoints
* Database naming remains snake_case and is not exposed through the API

### Auth Endpoints

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

`POST /api/auth/login`

* Public.
* Body: `{ "email": string, "password": string }`.
* On success, sets the HTTP-only session cookie and returns the current admin summary.
* On failure, returns a generic `401`.

`GET /api/auth/me`

* Requires a valid session.
* Returns the current admin summary and CSRF token.

`POST /api/auth/logout`

* Revokes the current session and clears the cookie.
* Should tolerate repeated calls without exposing internal state.

### Student Endpoints

```text
GET    /api/students
POST   /api/students
GET    /api/students/:studentId
PATCH  /api/students/:studentId
DELETE /api/students/:studentId
```

All student endpoints require an active admin session. State-changing student endpoints also require a valid CSRF token.

`GET /api/students` returns non-deleted students only. It supports:

```text
q
status
subscribedPlan
page
pageSize
```

Example:

```text
GET /api/students?q=ana&status=active&subscribedPlan=basic&page=1&pageSize=20
```

`q` searches:

* `name` with case-insensitive partial matching
* `email` with case-insensitive partial matching
* `cpf` by digits-only partial matching
* `phone` by digits-only partial matching

Empty or whitespace-only `q` is treated as no search. Search query values must not be logged because they may contain
PII. List results still return masked PII fields.

`GET /api/students/:studentId` returns one non-deleted student or `404`.

`POST /api/students` creates a student. All required student fields must be present.

`PATCH /api/students/:studentId` partially updates a student. Missing fields remain unchanged. Explicit `null` and empty
strings are rejected for required fields. Deleted students return `404` and cannot be updated.

`DELETE /api/students/:studentId` soft-deletes a student by setting `deletedAt`.

The following endpoints are deferred:

* restore student
* hard-delete student
* bulk operations
* export
* audit/history
* admin-user CRUD
* password reset
* auth refresh
* public registration

### Pagination

`GET /api/students` will use page/pageSize pagination:

```json
{
  "data": [],
  "page": 1,
  "pageSize": 20,
  "total": 57,
  "totalPages": 3
}
```

Rules:

* Default `page` is `1`.
* Default `pageSize` is `20`.
* Maximum `pageSize` is `100`.
* Invalid pagination values return `400`.
* Default sorting is `createdAt desc`.

Explicit sort options are deferred.

### Response Shapes

Single-resource responses return the resource directly.

Student detail/create/update responses return full formatted PII to authenticated admins:

```json
{
  "id": "uuid",
  "name": "Ana Silva",
  "email": "ana@example.com",
  "cpf": "123.456.789-09",
  "phone": "+55 81 99999-8888",
  "subscribedPlan": "basic",
  "status": "active",
  "createdAt": "2026-05-24T12:00:00.000Z",
  "updatedAt": "2026-05-24T12:00:00.000Z"
}
```

Student list responses return masked PII:

```json
{
  "id": "uuid",
  "name": "Ana Silva",
  "email": "a***@example.com",
  "cpf": "***.456.789-**",
  "phone": "(**) *****-8888",
  "subscribedPlan": "basic",
  "status": "active",
  "createdAt": "2026-05-24T12:00:00.000Z",
  "updatedAt": "2026-05-24T12:00:00.000Z"
}
```

Auth responses return an `admin` object:

```json
{
  "admin": {
    "id": "uuid",
    "name": "Admin Name",
    "email": "admin@example.com"
  }
}
```

`GET /api/auth/me` also returns a CSRF token:

```json
{
  "admin": {
    "id": "uuid",
    "name": "Admin Name",
    "email": "admin@example.com"
  },
  "csrfToken": "token"
}
```

### Error Shape

All API errors return JSON:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email"
      }
    ]
  }
}
```

Rules:

* `code` is stable uppercase snake case.
* `message` is safe for humans but not overly detailed for sensitive auth failures.
* `details` is optional and mainly for validation errors.
* Stack traces are never returned.
* Sensitive submitted values such as CPF, phone, email, and password are not echoed in error responses.

Initial error codes:

```text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
INVALID_CREDENTIALS
FORBIDDEN
NOT_FOUND
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

HTTP mapping:

* `400` for validation, query, and route-param errors.
* `401` for unauthenticated requests or invalid credentials.
* `403` for authenticated but unauthorized requests.
* `404` for missing or deleted students.
* `409` for CPF/email uniqueness conflicts.
* `429` for rate limiting.
* `500` for unexpected server errors.

### Validation and Tests

The API will use Zod schemas at the HTTP boundary for request bodies, query params, route params, and enum validation.
Domain-specific helpers will handle CPF, email, and phone normalization.

Required API integration tests will use Vitest and Supertest. The minimum coverage includes:

* login success and failure
* logout session revocation
* `me` requiring a valid session
* inactive admin rejection
* unauthenticated student endpoint rejection
* CSRF enforcement on state-changing requests
* student field validation
* duplicate active CPF/email returning `409`
* list masking PII
* detail returning full PII
* soft delete exclusion from list/detail/update

## Consequences

### Positive

* Endpoint naming is predictable and easy to document.
* The API contract is explicit before implementation.
* Error responses have stable machine-readable codes.
* Zod validation creates typed, testable request parsing.
* Page/pageSize pagination is simple for admin tables.
* PII exposure rules are reflected directly in response shapes.

### Negative / Trade-offs

* There is no URL-level API version in v1.
* Page/pageSize pagination may need replacement if the dataset becomes large.
* Search over CPF, email, and phone must be handled carefully to avoid logging PII.
* The frontend must fetch detail before editing if it needs full PII values after a masked list response.

## Deferred Decisions

* URL versioning.
* Public/external API contract.
* Explicit sort API.
* Cursor pagination.
* Export endpoints.
* Bulk endpoints.
* Admin-user management endpoints.

## References

* [ADR-001 - Application Architecture and Technology Stack](ADR-001-application-architecture-and-technology-stack.md)
* [ADR-002 - Authentication and Authorization Strategy](ADR-002-authentication-and-authorization-strategy.md)
* [ADR-003 - Student Domain Model and Entity Definitions](ADR-003-student-domain-model-and-entity-definitions.md)
* [ADR-005 - PII and LGPD Compliance Controls](ADR-005-pii-and-lgpd-compliance-controls.md)
* [Product documentation](../product.md)
