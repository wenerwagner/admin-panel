---
title: Testing Strategy
type: architecture
status: accepted
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [testing, backend, frontend, vitest, supertest, postgres]
area: admin-panel
related:
  - ADR-001 - Application Architecture and Technology Stack
  - ADR-002 - Authentication and Authorization Strategy
  - ADR-003 - Student Domain Model and Entity Definitions
  - ADR-004 - REST API Design and Naming Conventions
  - ADR-005 - PII and LGPD Compliance Controls
---

# ADR-009 - Testing Strategy

* **Status:** Accepted
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

The product requirements emphasize authorization, validation, maintainability, and protection of student PII. The
highest-risk behaviors are backend/domain/security behaviors: who can access student data, whether CPF/email/phone rules
are correct, whether sessions and CSRF work, and whether PII masking/logging rules are respected.

ADR-004 and ADR-005 already list some required API tests. This ADR defines the broader testing strategy and clarifies
that broad frontend component coverage is not required in v1.

## Considered Options

Chosen option: **Backend-focused tests with real PostgreSQL integration coverage and targeted unit tests**.

1. **Backend-focused tests with real PostgreSQL integration coverage and targeted unit tests** *(chosen)*
   * *Pros:* Exercises the riskiest behavior, including auth, Prisma, indexes, soft delete, and PII handling.
   * *Cons:* Requires test database setup and slightly slower tests than pure mocks.

2. **Mock Prisma/database access for API tests**
   * *Pros:* Faster and easier to run without infrastructure.
   * *Cons:* Misses important failures in sessions, uniqueness, soft delete, and database queries.

3. **Broad frontend component and snapshot test coverage**
   * *Pros:* Can catch UI regressions.
   * *Cons:* Does not target the highest-risk rules for this project and can create noisy maintenance work.

4. **End-to-end browser tests as required v1 coverage**
   * *Pros:* Exercises complete browser flows.
   * *Cons:* Adds setup and maintenance cost before it is justified by the product scope.

## Decision

Required v1 tests will focus on backend API, domain helpers, security rules, validation, and PII behavior.

The backend test stack will use:

```text
Vitest
Supertest
real PostgreSQL test database
Prisma
```

API integration tests must run against a disposable PostgreSQL database. Mocking Prisma is allowed only for narrow unit
tests where the database is not the behavior under test.

Integration test setup may create data directly through database factories or seed helpers, then exercise the behavior
under test through HTTP/Supertest. Tests should not be forced to create all setup data through public API flows unless
the create endpoint itself is under test.

Required backend/API coverage includes:

* login success and failure
* logout session revocation
* `GET /api/auth/me` requiring a valid session
* inactive admin rejection
* unauthenticated student endpoint rejection
* CSRF enforcement on state-changing requests
* student field validation
* CPF validation, including check digits and repeated-digit rejection
* email validation and normalization
* phone validation and normalization
* duplicate active CPF/email returning `409`
* list response masking CPF, email, and phone
* detail/create/update responses returning full formatted PII to authenticated admins
* soft-deleted student exclusion from list/detail/update
* deleted student uniqueness behavior according to partial unique indexes
* API error shape and stable error codes
* absence of submitted password/CPF/phone in tested log paths where practical

Required unit coverage includes pure helpers where correctness matters:

* CPF normalization and validation
* phone parsing/formatting behavior
* PII masking helpers
* API error mapping
* validation issue mapping

Frontend component tests are optional in v1. The project does not require high frontend test coverage, snapshot tests,
or broad React component testing. If frontend tests are added, they should be limited to cheap smoke tests or focused
tests around API error mapping.

End-to-end browser tests are not required in v1. A manual happy-path checklist in the README or operations docs is
sufficient for v1 UI verification.

## Consequences

### Positive

* Tests focus on the product's highest-risk rules.
* Database-backed behavior is tested against real PostgreSQL instead of mocks.
* The suite verifies security, validation, and PII behavior before UI polish.
* The project avoids noisy frontend snapshot coverage.

### Negative / Trade-offs

* The test suite needs disposable database setup.
* API integration tests are slower than pure unit tests.
* UI regressions may not be caught automatically in v1.
* Manual UI verification remains necessary.

## Deferred Decisions

* Required frontend component test coverage.
* Required browser end-to-end tests.
* Coverage percentage thresholds.
* CI provider and full CI pipeline design.
* Automated OpenAPI contract validation.

## References

* [ADR-001 - Application Architecture and Technology Stack](ADR-001-application-architecture-and-technology-stack.md)
* [ADR-002 - Authentication and Authorization Strategy](ADR-002-authentication-and-authorization-strategy.md)
* [ADR-003 - Student Domain Model and Entity Definitions](ADR-003-student-domain-model-and-entity-definitions.md)
* [ADR-004 - REST API Design and Naming Conventions](ADR-004-rest-api-design-and-naming-conventions.md)
* [ADR-005 - PII and LGPD Compliance Controls](ADR-005-pii-and-lgpd-compliance-controls.md)
