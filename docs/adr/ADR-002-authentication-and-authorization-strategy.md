---
title: Authentication and Authorization Strategy
type: architecture
status: draft
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [authentication, authorization, security, sessions, backend]
area: admin-panel
related:
  - ADR-001 - Application Architecture and Technology Stack
  - ADR-003 - Student Domain Model and Entity Definitions
  - ADR-004 - REST API Design and Naming Conventions
  - ADR-005 - PII and LGPD Compliance Controls
---

# ADR-002 - Authentication and Authorization Strategy

* **Status:** Draft
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

The application is an internal backoffice panel for Escola do Breno. Administrators sign in and manage student records
that include personal data such as name, email, CPF, and phone number.

ADR-001 selected a React SPA, an Express REST API, PostgreSQL, Prisma, Docker Compose, and a same-application REST
boundary. The deployed application is expected to expose a single public web origin, with Caddy serving the frontend and
proxying `/api` requests to the backend.

Authentication and authorization must be simple enough for the first version, but strong enough to protect student PII
and make API behavior testable before implementation starts.

## Considered Options

Chosen option: **PostgreSQL-backed opaque sessions in HTTP-only cookies**.

1. **PostgreSQL-backed opaque sessions in HTTP-only cookies** *(chosen)*
   * *Pros:* Fits the same-origin SPA/API deployment, keeps session tokens out of frontend JavaScript, supports logout
     and revocation, and is straightforward to test.
   * *Cons:* Requires a sessions table and database lookup for authenticated requests.

2. **JWT access/refresh tokens stored by the frontend**
   * *Pros:* Common for APIs consumed by multiple clients and can reduce server-side session state.
   * *Cons:* Browser storage increases token exposure risk, and revocation/logout become more complex than needed for
     this internal panel.

3. **Stateless JWT in an HTTP-only cookie**
   * *Pros:* Keeps tokens away from frontend JavaScript and avoids session lookup.
   * *Cons:* Logout and revocation are weak unless server-side state is added, which removes the main simplicity
     benefit.

4. **External identity provider**
   * *Pros:* Can provide stronger organization-level identity management.
   * *Cons:* Adds operational and configuration complexity before there is a confirmed organization identity provider
     requirement.

5. **RBAC in v1**
   * *Pros:* Prepares for multiple admin permission levels.
   * *Cons:* Adds design and testing surface without a current product requirement for more than one admin capability.

## Decision

Admin users will be stored in the application database. There will be no public registration endpoint in v1.

Admin users will authenticate with email and password. Email addresses will be trimmed, lowercased, required, and unique.
Passwords will be hashed with `argon2`; plaintext passwords will never be stored.

The first admin account will be created intentionally through a seed or CLI flow:

* Local/evaluation environments may use a documented seed command or env-seeded admin.
* Production must not create a default public admin automatically.
* A production admin must be created through an explicit operator action, such as `npm run admin:create -- --email ...`.
* If an admin email already exists, seed/create-admin commands must not silently overwrite the password.

Authenticated browser sessions will use server-managed opaque session tokens:

* The backend generates a high-entropy token using Node's built-in `crypto.randomBytes`.
* The raw token is sent to the browser in an HTTP-only cookie.
* Only a hash of the token is stored in PostgreSQL.
* Requests authenticate by hashing the presented cookie value and looking up an active, unexpired, unrevoked session.
* Sessions have an 8-hour absolute lifetime.
* v1 will not include sliding sessions, refresh endpoints, or a remember-me option.

The session cookie settings are:

```text
Name: admin_session
HttpOnly: true
Secure: true in production, false only for local HTTP development
SameSite: Lax
Path: /
Max-Age/Expires: aligned with the 8-hour server-side session expiry
Domain: unset by default
```

Authorization will be single-role in v1. Any active authenticated admin can perform all student CRUD operations.

* `AdminUser.isActive` controls whether the admin may authenticate or continue using existing sessions.
* There will be no roles, permissions, or RBAC tables in v1.
* All student endpoints require a valid session for an active admin.
* Deactivated admins must not be able to log in, and existing sessions for inactive admins must be rejected or revoked.

The auth API surface for v1 is limited to:

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

`POST /api/auth/login` verifies email and password, creates the server-side session, sets the cookie, and returns the
current admin summary. Invalid credentials return a generic `401` without revealing whether the email exists.

`GET /api/auth/me` returns the current admin summary and the CSRF token used by the SPA for state-changing requests.

`POST /api/auth/logout` revokes the current session and clears the cookie. It should be idempotent enough that repeated
logout attempts are harmless.

Because cookie-based sessions are used, v1 will include CSRF protection for authenticated state-changing requests:

* `POST /api/auth/logout`
* `POST /api/students`
* `PATCH /api/students/:studentId`
* `DELETE /api/students/:studentId`

The SPA will send the CSRF token in the `X-CSRF-Token` header. `POST /api/auth/login` is exempt from CSRF protection in
v1, but remains rate-limited.

Login brute-force protection will use application-level rate limiting on `POST /api/auth/login`:

* Rate limit by IP address.
* Rate limit by normalized email where practical.
* Return generic invalid-credential responses.
* Do not permanently lock accounts in v1.
* Do not add CAPTCHA in v1.

The Express backend must trust reverse proxy headers only when configured to run behind Caddy or another known proxy.

The API will be same-origin only in production. CORS will be disabled or restricted in production. Local development may
allow the Vite dev server origin through environment configuration.

Backend environment configuration must be explicit and validated at startup, using Zod:

```text
NODE_ENV
PORT
DATABASE_URL
SESSION_COOKIE_NAME
SESSION_TTL_HOURS
CSRF_SECRET
CORS_ALLOWED_ORIGINS
TRUST_PROXY
LOG_LEVEL
```

Recommended defaults:

```text
SESSION_COOKIE_NAME=admin_session
SESSION_TTL_HOURS=8
TRUST_PROXY=false locally, true only behind a configured reverse proxy
LOG_LEVEL=info
```

## Consequences

### Positive

* Sessions can be revoked server-side.
* Session tokens are not readable by frontend JavaScript.
* The authorization rule is clear and testable: active authenticated admins can manage students.
* No public registration surface is exposed.
* Auth decisions align with the same-origin deployment described by ADR-001.
* Password hashing, CSRF protection, and login rate limiting are explicitly selected before implementation.

### Negative / Trade-offs

* The backend must maintain a sessions table.
* The frontend must handle CSRF tokens for state-changing requests.
* There is no delegated SSO or organization-wide account lifecycle in v1.
* There are no separate roles or permissions in v1.
* Password reset and admin management workflows are deferred.

## Deferred Decisions

* Password reset or forgot-password workflow.
* Admin user management endpoints.
* Multi-role authorization or RBAC.
* External identity provider integration.
* Compromised-password checking.
* Full account lockout policy.

## References

* [ADR-001 - Application Architecture and Technology Stack](ADR-001-application-architecture-and-technology-stack.md)
* [ADR-003 - Student Domain Model and Entity Definitions](ADR-003-student-domain-model-and-entity-definitions.md)
* [ADR-004 - REST API Design and Naming Conventions](ADR-004-rest-api-design-and-naming-conventions.md)
* [ADR-005 - PII and LGPD Compliance Controls](ADR-005-pii-and-lgpd-compliance-controls.md)
* [Product documentation](../product.md)
