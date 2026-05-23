---
description: This file is an evolving document. Should add created and updated dates, also status, and who created or updated the file. Also the version of the file.
---

# Overview

An administrative student management panel for **Escola do Breno**.

- The product is a focused internal CRUD application for administrators to sign in and manage student records.
- The product should stay intentionally simple: there are no student lifecycle workflows or business rules beyond
  storing and maintaining student data securely.

## Early Constraints Definitions

The following technical constraints were defined from the beginning of the project and should be followed:

- Frontend and Backend should use TypeScript.
- The database used should be PostgreSQL.
- The project should use Docker Compose. The entire setup must run with `docker compose up`.

## Functional Requirements

- Admins can log in.
- Admins can list students.
- Admins can add a student.
- Admins can edit student data.
- Admins can delete a student.
- Admins can store the following minimum student fields:
    - Name
    - Email
    - CPF
    - Phone number
    - Subscribed plan
    - Status

### Optional (Nice to have)

- Admins can filter or search the student list.
- Student deletion can be implemented as soft delete when justified by a product or modeling decision.

## Non-Functional Requirements

- The product should be LGPD compliant.
- The product must protect student PII through authorization and server-side validation.
- Authorization behavior must be testable, especially around who can access student management features.
- Validation behavior must be testable for sensitive fields such as CPF, email, and phone number.
- The implementation should prioritize clear organization, maintainability, and domain modeling over feature breadth or
  visual polish.

### Optional (Nice to have)
- The code should have linting configured.
- The API should have tests.

## Use cases

- As an administrator, I want to log in so that only authorized users can manage student data.
- As an administrator, I want to see the list of students so that I can inspect current school records.
- As an administrator, I want to add a student so that a new record can be registered.
- As an administrator, I want to edit student data so that incorrect or outdated information can be corrected.
- As an administrator, I want to delete a student so that records that should no longer be managed can be removed from
  the active dataset.
- As an administrator, I may want to search or filter students so that I can find records more quickly.

## Out of scope
- Audit log / edit history
- Business rules regarding students (status transitions, “cannot edit canceled students,” etc.)
- Triggers, jobs, scheduled workflows
- State machines
- Fancy UI / branding / polished design

## Glossary

- Admin: Authorized user who can access the management panel and perform student CRUD operations.
- Student: Person enrolled or represented in Breno School's administrative records.
- CPF: Brazilian individual taxpayer registry number. Treated as sensitive personal data.
- Phone number: Student contact number. Treated as sensitive personal data.
- Subscribed plan: The student's commercial plan, such as `basic` or `premium`.
- Status: Current administrative state of a student record, such as `active`, `canceled`, or `paused`. The status is
  descriptive only; it must not imply business-rule transitions unless explicitly added later.
- CRUD: Create, read, update, and delete operations for student records.