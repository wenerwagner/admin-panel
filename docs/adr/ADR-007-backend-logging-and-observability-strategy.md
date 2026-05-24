---
title: Backend Logging and Observability Strategy
type: architecture
status: draft
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [backend, logging, observability, pino, pii]
area: admin-panel
related:
  - ADR-001 - Application Architecture and Technology Stack
  - ADR-002 - Authentication and Authorization Strategy
  - ADR-004 - REST API Design and Naming Conventions
  - ADR-005 - PII and LGPD Compliance Controls
  - ADR-008 - Application Error Handling Strategy
---

# ADR-007 - Backend Logging and Observability Strategy

* **Status:** Draft
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

The application handles student PII, including name, email, CPF, and phone number. ADR-005 already states that logs must
not become a secondary PII database and recommends structured logging with `pino`.

The backend still needs a complete logging strategy for library selection, request correlation, log format, local versus
production behavior, redaction, and frontend error support.

## Considered Options

Chosen option: **Structured backend logging with pino, request IDs, and explicit redaction**.

1. **Structured backend logging with pino, request IDs, and explicit redaction** *(chosen)*
   * *Pros:* Produces machine-readable logs, supports request correlation, and aligns with privacy requirements.
   * *Cons:* Requires careful logger configuration and discipline around log metadata.

2. **Ad hoc console logging**
   * *Pros:* Very simple during early implementation.
   * *Cons:* Inconsistent, hard to search, easy to leak sensitive data, and hard to operate in containers.

3. **External error reporting or observability service in v1**
   * *Pros:* Provides richer production diagnostics.
   * *Cons:* Adds privacy, cost, configuration, and operational decisions before they are required.

## Decision

The backend will use `pino` for application logging.

Production logs will be structured JSON written to stdout/stderr so Docker and host-level logging can collect them.
Local development may use `pino-pretty` or equivalent for human-readable output, while preserving the same core fields
and redaction behavior.

Every HTTP request will have a request ID:

* The backend may accept a safe incoming `X-Request-Id` value.
* If no safe ID is provided, the backend generates one.
* The request ID is attached to request-scoped logs.
* The response includes the request ID in the `X-Request-Id` header.
* Unexpected `500` error responses may include the request ID in the response body.

HTTP request logs should include:

```text
requestId
method
route template when available
status code
durationMs
```

HTTP request logs must not include request bodies, response bodies, cookies, authorization headers, session tokens, CSRF
tokens, passwords, CPF, phone, email, name, or raw search query values.

Validation errors may log field names and error codes, but not submitted values. Authentication failures must log only
generic metadata and must not reveal whether an email exists.

Server-side error logs may include stack traces for unexpected errors, but attached metadata must be redacted and must
not contain PII.

The backend will use explicit `pino` redaction/serializers for known sensitive paths and will avoid passing arbitrary
request objects or response objects directly to logs.

Recommended log levels:

```text
fatal: process cannot continue
error: unexpected failures and failed background/operator actions
warn: suspicious or degraded behavior, such as rate limiting or rejected CSRF
info: startup, shutdown, and request completion
debug: local diagnostic details only
trace: not used by default
```

Frontend logging in v1 will be minimal and console-only. The frontend must not use an external browser error reporting
service in v1 and must not log PII. User-facing unexpected error messages may show the backend request ID when available.

## Consequences

### Positive

* Logs are useful for debugging and operations without exposing PII by default.
* Request IDs make frontend-reported errors traceable in backend logs.
* The strategy works naturally with Docker Compose and stdout logging.
* Local development remains readable through pretty logging.

### Negative / Trade-offs

* Redaction rules must be kept current as request shapes evolve.
* Developers need to avoid logging arbitrary objects that may contain sensitive fields.
* No external frontend or backend observability service is available in v1.

## Deferred Decisions

* External error reporting service.
* Centralized log aggregation provider.
* Metrics and dashboards.
* Distributed tracing.
* Audit logging of admin actions.
* Browser-side production error collection.

## References

* [ADR-001 - Application Architecture and Technology Stack](ADR-001-application-architecture-and-technology-stack.md)
* [ADR-002 - Authentication and Authorization Strategy](ADR-002-authentication-and-authorization-strategy.md)
* [ADR-004 - REST API Design and Naming Conventions](ADR-004-rest-api-design-and-naming-conventions.md)
* [ADR-005 - PII and LGPD Compliance Controls](ADR-005-pii-and-lgpd-compliance-controls.md)
* [ADR-008 - Application Error Handling Strategy](ADR-008-application-error-handling-strategy.md)
