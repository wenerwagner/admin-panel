---
title: Student Domain Model and Entity Definitions
type: architecture
status: accepted
date: 2026-05-24
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [domain-model, database, prisma, students, validation]
area: admin-panel
related:
  - ADR-001 - Application Architecture and Technology Stack
  - ADR-002 - Authentication and Authorization Strategy
  - ADR-004 - REST API Design and Naming Conventions
  - ADR-005 - PII and LGPD Compliance Controls
---

# ADR-003 - Student Domain Model and Entity Definitions

* **Status:** Accepted
* **Date:** 2026-05-24
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

The application manages student records for Escola do Breno. Product documentation defines the minimum student fields:

* Name
* Email
* CPF
* Phone number
* Subscribed plan
* Status

The product is intentionally simple. There are no lifecycle workflows, state machines, audit logs, scheduled jobs, or
business rules beyond storing and maintaining student data securely.

ADR-001 selected PostgreSQL and Prisma. ADR-002 defines active admins as the only users allowed to access student
management features. ADR-005 defines privacy constraints for PII fields.

## Considered Options

Chosen options: **Required fields for all minimum product data** and **Soft delete with `deletedAt`**.

1. **Required fields for all minimum product data** *(chosen)*
   * *Pros:* Avoids ambiguous incomplete records and matches the product requirements.
   * *Cons:* Admins cannot create placeholder students without complete data.

2. **Optional contact fields**
   * *Pros:* More flexible during data entry.
   * *Cons:* Weakens the defined minimum record and complicates validation and UI behavior.

3. **Soft delete with `deletedAt`** *(chosen)*
   * *Pros:* Reduces accidental irreversible data loss and preserves room for future retention/anonymization policy.
   * *Cons:* Keeps PII in the database until a retention or purge policy is implemented.

4. **Hard delete**
   * *Pros:* Removes active database rows immediately.
   * *Cons:* Can conflict with recovery, school record retention, and future compliance review.

5. **Free-text plan and status**
   * *Pros:* Flexible.
   * *Cons:* Makes validation, filtering, and UI controls less reliable.

## Decision

The first version will use three core entities:

* `AdminUser`
* `Session`
* `Student`

Entity IDs exposed by the API will be UUID v4 strings. CPF and email must never be used as URL identifiers.

Database tables and columns will use snake_case. Prisma models, TypeScript objects, and JSON fields will use camelCase.
Prisma will map between them with `@@map` and `@map` where needed.

### AdminUser

`AdminUser` represents an administrator who can sign in to the backoffice.

Fields:

```text
id
name
email
passwordHash
isActive
createdAt
updatedAt
```

Rules:

* `email` is required, unique, trimmed, lowercased, and validated with basic email syntax.
* `passwordHash` stores an Argon2 password hash.
* `isActive` defaults to `true`.
* Inactive admins cannot authenticate or use existing sessions.

### Session

`Session` represents one authenticated browser session.

Fields:

```text
id
adminUserId
tokenHash
expiresAt
revokedAt
createdAt
```

Rules:

* `tokenHash` is unique.
* Raw session tokens are never stored.
* Sessions expire after 8 hours.
* `revokedAt` is set on logout or administrative revocation.

### Student

`Student` represents a person enrolled or represented in the school's administrative records.

Fields:

```text
id
name
email
cpf
phone
subscribedPlan
status
createdAt
updatedAt
deletedAt
```

All six product-defined student fields are required on create:

* `name`
* `email`
* `cpf`
* `phone`
* `subscribedPlan`
* `status`

`name` is not unique. Empty or whitespace-only names are rejected.

`email` is required and unique among non-deleted students. It is trimmed, lowercased, validated with basic email syntax,
and editable by admins. v1 does not include email confirmation, email ownership verification, MX checks, Gmail-specific
normalization, or plus-alias normalization.

`cpf` is required and unique among non-deleted students. The API accepts formatted or unformatted CPF values. The server
normalizes CPF to digits before validation and storage. Validation requires exactly 11 digits, valid CPF check digits,
and rejection of repeated-digit values such as `00000000000`.

`phone` is required but not unique. The API accepts Brazilian formatted or unformatted phone values. The server stores
phone numbers as E.164-style strings, such as `+5581999998888`, using `libphonenumber-js` for parsing and formatting.

`subscribedPlan` is an enum with these values:

```text
BASIC
PREMIUM
```

The API represents those values as lowercase strings:

```text
basic
premium
```

`status` is an enum with these values:

```text
ACTIVE
PAUSED
CANCELED
```

The API represents those values as lowercase strings:

```text
active
paused
canceled
```

`status` is descriptive only in v1. There are no transition rules, lifecycle workflows, or restrictions such as "canceled
students cannot be edited."

Student deletion will be soft delete:

* `DELETE /api/students/:studentId` sets `deletedAt`.
* Normal list and detail endpoints exclude deleted students.
* Deleted students return `404` from normal detail and update endpoints.
* v1 has no restore endpoint.
* v1 has no automated purge or anonymization job.

Because soft delete is used, active student uniqueness must be enforced with PostgreSQL partial unique indexes:

```sql
CREATE UNIQUE INDEX students_email_active_unique ON students (email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX students_cpf_active_unique ON students (cpf) WHERE deleted_at IS NULL;
```

These indexes may need raw SQL migrations because Prisma schema support for partial indexes is limited.

### Initial Prisma Shape

```prisma
model AdminUser {
  id           String    @id @default(uuid()) @db.Uuid
  name         String
  email        String    @unique
  passwordHash String    @map("password_hash")
  isActive     Boolean   @default(true) @map("is_active")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  sessions     Session[]

  @@map("admin_users")
}

model Session {
  id          String    @id @default(uuid()) @db.Uuid
  adminUserId String    @map("admin_user_id") @db.Uuid
  tokenHash   String    @unique @map("token_hash")
  expiresAt   DateTime  @map("expires_at")
  revokedAt   DateTime? @map("revoked_at")
  createdAt   DateTime  @default(now()) @map("created_at")

  adminUser   AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)

  @@index([adminUserId])
  @@index([expiresAt])
  @@map("sessions")
}

model Student {
  id             String         @id @default(uuid()) @db.Uuid
  name           String
  email          String
  cpf            String
  phone          String
  subscribedPlan SubscribedPlan @map("subscribed_plan")
  status         StudentStatus
  createdAt      DateTime       @default(now()) @map("created_at")
  updatedAt      DateTime       @updatedAt @map("updated_at")
  deletedAt      DateTime?      @map("deleted_at")

  @@index([status])
  @@index([subscribedPlan])
  @@index([deletedAt])
  @@map("students")
}

enum SubscribedPlan {
  BASIC
  PREMIUM
}

enum StudentStatus {
  ACTIVE
  PAUSED
  CANCELED
}
```

## Consequences

### Positive

* The student data model is small and directly aligned with product requirements.
* CPF, email, and phone are normalized before storage.
* UUIDs avoid exposing sequential database identifiers.
* Enum values make validation, filtering, and UI options predictable.
* Soft delete reduces accidental data loss.

### Negative / Trade-offs

* Soft-deleted PII remains in the database until retention/purge policy is added.
* Partial unique indexes require raw SQL migrations or careful migration handling.
* Required fields make incomplete student records impossible in v1.
* Phone parsing adds a dependency on `libphonenumber-js`.

## Deferred Decisions

* Restore endpoint for deleted students.
* Automated purge or anonymization job.
* Retention period for deleted student PII.
* Audit log and field-level edit history.
* Additional subscribed plans.
* Student lifecycle transition rules.

## References

* [ADR-001 - Application Architecture and Technology Stack](ADR-001-application-architecture-and-technology-stack.md)
* [ADR-002 - Authentication and Authorization Strategy](ADR-002-authentication-and-authorization-strategy.md)
* [ADR-004 - REST API Design and Naming Conventions](ADR-004-rest-api-design-and-naming-conventions.md)
* [ADR-005 - PII and LGPD Compliance Controls](ADR-005-pii-and-lgpd-compliance-controls.md)
* [Product documentation](../product.md)
