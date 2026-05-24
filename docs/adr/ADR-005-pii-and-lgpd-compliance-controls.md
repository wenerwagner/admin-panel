---
title: PII and LGPD Compliance Controls
type: architecture
status: draft
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [pii, lgpd, privacy, security, compliance]
area: admin-panel
related:
  - ADR-001 - Application Architecture and Technology Stack
  - ADR-002 - Authentication and Authorization Strategy
  - ADR-003 - Student Domain Model and Entity Definitions
  - ADR-004 - REST API Design and Naming Conventions
---

# ADR-005 - PII and LGPD Compliance Controls

* **Status:** Draft
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

The application stores and displays student personal data for Escola do Breno. The product documentation explicitly
requires LGPD compliance and protection of student PII through authorization and server-side validation.

This ADR records engineering controls and product assumptions. It is not legal advice. The business owner must confirm
the legal basis, privacy notice, retention period, data subject request process, and production operating
responsibilities before real production operation.

## Decision

The application will treat the following student fields as personal data:

* name
* email
* CPF
* phone
* subscribed plan
* status

CPF receives heightened care because it is a strong Brazilian national identifier. Email, phone, and name are also PII
and must not be casually logged or exposed.

The product/legal assumption for v1 is that the school processes student data for legitimate educational or contractual
administration. This assumption must be confirmed by the business owner before production use.

### Access Control

Only active authenticated admins may access student data.

The access model is intentionally simple in v1:

* No public student endpoints.
* No public registration.
* No unauthenticated search.
* No field-level permissions.
* No roles/RBAC.

This relies on ADR-002's active-admin authorization rule.

### Data Minimization in API Responses

Student list responses return masked PII:

* masked email
* masked CPF
* masked phone

Student detail, create, and update responses may return full formatted PII to authenticated admins because those flows
represent intentional access to a specific record.

Search may match against name, email, CPF digits, and phone digits for authenticated admins, but the raw query string
must not be logged because it may contain PII.

### Storage and Normalization

PII will be stored in normalized regular database columns:

* email: trimmed and lowercased
* CPF: digits only
* phone: E.164-style string

v1 will not use application-level field encryption for CPF, email, or phone.

The application will rely on:

* active-admin authorization
* HTTP-only secure session cookies
* CSRF protection for state-changing requests
* HTTPS in production
* same-origin production access
* masked list responses
* no request/response body logging by default
* explicit log redaction
* database not being publicly exposed
* treating backups as sensitive data

Field-level encryption is deferred because it complicates search, uniqueness, validation, admin editing, and key
management. If hosting, threat model, or compliance review requires stronger controls later, field encryption or managed
database encryption should be revisited in a separate ADR.

### Logging

The backend must not log request or response bodies by default.

Sensitive fields include:

```text
password
passwordHash
sessionToken
cookie
cpf
phone
email
name
```

Logging rules:

* Do not log full request bodies.
* Do not log full response bodies.
* Do not log cookies.
* Do not log authorization/session headers.
* Do not log raw search query values.
* Log method, route template, status code, duration, and request id.
* Validation errors may log field names but not submitted values.
* Auth failures must log generic event metadata only.
* Server-side error logs may include stack traces, but attached metadata must exclude PII.

Structured logging should use `pino` with explicit serializers and redaction configuration.

Example safe log event:

```json
{
  "requestId": "...",
  "method": "POST",
  "route": "/api/auth/login",
  "status": 401,
  "durationMs": 18
}
```

### Deletion, Retention, and Data Subject Rights

Student deletion in v1 is soft delete:

* `DELETE /api/students/:studentId` sets `deletedAt`.
* Deleted students are excluded from normal list and detail endpoints.
* Deleted students cannot be updated through normal endpoints.
* v1 has no restore endpoint.
* v1 has no automated purge job.
* v1 has no anonymization job.

This is not a complete retention policy. Before real production operation, the business owner must define:

* retention period for active and deleted student records
* purge or anonymization process
* backup retention expectations
* whether legal/school record retention obligations apply
* how LGPD data subject requests are received, verified, fulfilled, and recorded

v1 will not implement dedicated LGPD request workflows:

* Correction can be performed manually through the student edit flow.
* Removal from active operational views can be performed through soft delete.
* Export/access requests require an external/manual process.
* Anonymization/purge requests require an external/manual process until implemented.

### Audit Trail

v1 will not include a full audit log of admin actions or field-level change history.

The system will keep basic timestamps:

* `Student.createdAt`
* `Student.updatedAt`
* `Student.deletedAt`
* `AdminUser.createdAt`
* `AdminUser.updatedAt`
* `Session.createdAt`
* `Session.expiresAt`
* `Session.revokedAt`

Audit logging is deferred because a proper audit trail needs careful PII handling and is explicitly outside the current
product scope. For a production system handling student PII, audit logging is a strong future candidate.

### Required Test Coverage

The API test suite must cover:

* unauthenticated student access rejection
* inactive admin rejection
* CSRF protection on state-changing requests
* CPF, email, and phone validation
* list response masking for CPF, email, and phone
* detail response access for full PII
* duplicate active CPF/email conflict behavior
* soft-deleted student exclusion
* absence of submitted password/CPF/phone in tested log paths where practical

## Considered Options

1. **Access control, minimization, masking, and logging redaction without field-level encryption**
   * *Pros:* Practical for v1, supports search and uniqueness, keeps implementation understandable, and directly
     addresses the main exposure surfaces.
   * *Cons:* Database operators or database compromise could expose stored PII unless infrastructure controls are
     strong.

2. **Application-level field encryption for CPF, email, and phone**
   * *Pros:* Can reduce exposure from direct database access.
   * *Cons:* Complicates uniqueness, search, validation, display, key management, and incident recovery.

3. **Full LGPD workflow in v1**
   * *Pros:* More complete privacy operations inside the application.
   * *Cons:* Larger product scope and requires legal/business process decisions that are not yet defined.

4. **Hard delete on student deletion**
   * *Pros:* Removes active rows immediately.
   * *Cons:* Can conflict with record retention obligations and accidental deletion recovery.

## Consequences

### Positive

* PII handling rules are explicit before implementation.
* Broad list views minimize CPF, email, and phone exposure.
* Logging policy avoids turning logs into a secondary PII database.
* The ADR clearly separates engineering controls from legal/business obligations.
* The system remains simple enough for v1 while documenting production compliance gaps honestly.

### Negative / Trade-offs

* Soft-deleted PII remains in the database until retention/purge policy is implemented.
* No field-level encryption is used in v1.
* No dedicated data subject request workflow is available in the app.
* No full audit trail exists in v1.
* Production use requires business/legal decisions outside the codebase.

## Deferred Decisions

* Final legal basis confirmation.
* Privacy notice wording.
* Data retention period.
* Purge/anonymization process.
* Backup retention process.
* Data subject request workflow.
* Full audit logging.
* Application-level field encryption or managed database encryption requirements.

## References

* [ADR-001 - Application Architecture and Technology Stack](ADR-001-application-architecture-and-technology-stack.md)
* [ADR-002 - Authentication and Authorization Strategy](ADR-002-authentication-and-authorization-strategy.md)
* [ADR-003 - Student Domain Model and Entity Definitions](ADR-003-student-domain-model-and-entity-definitions.md)
* [ADR-004 - REST API Design and Naming Conventions](ADR-004-rest-api-design-and-naming-conventions.md)
* [Product documentation](../product.md)
