---
title: Application Error Handling Strategy
type: architecture
status: draft
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [backend, frontend, errors, validation, express]
area: admin-panel
related:
  - ADR-004 - REST API Design and Naming Conventions
  - ADR-006 - API Documentation and OpenAPI Strategy
  - ADR-007 - Backend Logging and Observability Strategy
---

# ADR-008 - Application Error Handling Strategy

* **Status:** Draft
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

ADR-004 defines the API error response shape and initial error codes. The project still needs to define how backend code
creates errors, how Express converts errors to HTTP responses, how validation errors are normalized, and how the
frontend reacts to different error categories.

Errors must be consistent, testable, safe for users, and safe for PII.

## Considered Options

Chosen option: **Typed application errors with centralized Express error middleware**.

1. **Typed application errors with centralized Express error middleware** *(chosen)*
   * *Pros:* Keeps status/code/message mapping consistent and makes error behavior testable.
   * *Cons:* Requires a small error abstraction and discipline in services/controllers.

2. **Return HTTP responses directly from each handler**
   * *Pros:* Simple for very small route handlers.
   * *Cons:* Error shape and status mapping can drift across endpoints.

3. **Expose raw library/framework errors**
   * *Pros:* Minimal custom code.
   * *Cons:* Leaks implementation details, creates unstable API messages, and risks exposing sensitive data.

## Decision

The backend will model expected failures as typed application errors and convert them to API responses in centralized
Express error middleware.

Controllers should be thin HTTP adapters. They may call validation helpers, read authenticated request context, call
services, and return successful responses. They should not duplicate error response formatting.

Services should throw typed application errors for expected application failures. Examples:

```text
ValidationError
AuthenticationRequiredError
InvalidCredentialsError
ForbiddenError
NotFoundError
ConflictError
RateLimitedError
```

The error middleware maps application errors to the standardized ADR-004 shape:

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

Stable API error codes are uppercase snake case. Public messages must be safe for humans and must not expose sensitive
values. Stack traces, Prisma messages, SQL details, exception class names, and internal metadata must not be returned to
clients.

Zod will be used for request validation at the HTTP boundary, but raw Zod messages are not the public API contract. Zod
issues must be mapped to application-controlled field messages such as:

```text
Required
Invalid email
Invalid CPF
Invalid phone
Must be one of: basic, premium
```

Unhandled or unexpected backend errors return a generic internal error response:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Unexpected server error",
    "requestId": "..."
  }
}
```

The `requestId` is included for unexpected errors when available. Internal details are logged server-side according to
ADR-007 after redaction.

The frontend must handle error categories deliberately:

* `VALIDATION_ERROR`: show field-level errors when details map to known form fields; otherwise show a form-level error.
* `AUTHENTICATION_REQUIRED`: redirect to login when an existing session is missing or expired.
* `INVALID_CREDENTIALS`: show a generic login failure message.
* `FORBIDDEN`: show a safe access-denied message.
* `NOT_FOUND`: show a record-not-found state or return to the list with a message.
* `CONFLICT`: show a duplicate-field or form-level conflict message.
* `RATE_LIMITED`: show a retry-later message.
* `INTERNAL_ERROR`: show a generic failure message and include request ID when present.

## Consequences

### Positive

* API error responses stay consistent across endpoints.
* Tests can assert stable error codes and public messages.
* Internal errors can be debugged through request IDs without leaking stack traces to users.
* Frontend behavior can be mapped from machine-readable error codes.
* Library-specific validation wording does not become part of the public contract.

### Negative / Trade-offs

* The backend needs a small error hierarchy and middleware.
* Developers must choose the correct application error instead of returning arbitrary responses.
* Field-message mapping adds maintenance work when validation rules change.

## Deferred Decisions

* Localized or translated error messages.
* Client-visible error documentation beyond OpenAPI.
* Full frontend error reporting service.
* Domain-specific error codes beyond the initial API codes.

## References

* [ADR-004 - REST API Design and Naming Conventions](ADR-004-rest-api-design-and-naming-conventions.md)
* [ADR-006 - API Documentation and OpenAPI Strategy](ADR-006-api-documentation-and-openapi-strategy.md)
* [ADR-007 - Backend Logging and Observability Strategy](ADR-007-backend-logging-and-observability-strategy.md)
