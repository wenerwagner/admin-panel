# Context

This file gives fast domain and project orientation for humans and AI agents. It is not a README, architecture record,
full product specification, session log, issue progress note, or PR status file.

## Product

This repository contains the administrative student management panel for Escola do Breno. The product is a focused
internal CRUD backoffice where authorized admins sign in and manage student records.

The app should stay intentionally simple. It stores and maintains student data securely; it does not model student
lifecycle workflows or broader school operations.

## Current V1 Scope

V1 includes admin login and student CRUD: list, create, edit, and delete. Search and filtering in the student list are
optional.

V1 does not include student lifecycle workflows, status transition rules, audit history, scheduled jobs, public student
access, RBAC, password reset, admin-user management, external identity providers, or production operations automation.

## Domain Vocabulary

For the full product glossary, use `docs/product.md`. This file keeps only the minimum vocabulary needed for fast
orientation.

- **Admin:** Authorized user who can access the management panel and perform student CRUD operations.
- **Student:** Person enrolled or represented in Escola do Breno administrative records.
- **CPF:** Brazilian individual taxpayer registry number. Treat as sensitive personal data.
- **Phone number:** Student contact number. Treat as sensitive personal data.
- **Subscribed plan:** The student's commercial plan, such as `basic` or `premium`.
- **Status:** Current administrative state of a student record, such as `active`, `paused`, or `canceled`. Status is
  descriptive only unless a later accepted decision adds transition rules.
- **CRUD:** Create, read, update, and delete operations for student records.

## Modeling Notes

The v1 domain model has three primary entities: `AdminUser`, `Session`, and `Student`.

Admins are application users who authenticate with email and password. Admin registration is not public. The first admin
is created through an explicit local seed or admin creation command. Sessions are opaque, PostgreSQL-backed, and stored
in HTTP-only cookies; the browser does not receive raw session state outside the cookie.

All product-defined student fields are required on create: name, email, CPF, phone number, subscribed plan, and status.

Student deletion is modeled as soft delete. Student email and CPF must be unique among non-deleted students.

CPF and phone number are sensitive identifiers. CPF receives heightened care because it is a strong Brazilian individual
identifier.

The API accepts formatted or unformatted CPF values, validates CPF check digits, and stores CPF as digits only. Phone
numbers are validated as Brazilian phone numbers and stored in an E.164-style format.

Student list responses expose masked email, CPF, and phone values. Student detail, create, and update responses expose
full formatted values to authenticated admins.

Student status is not a workflow state machine in v1. Do not infer rules such as "canceled students cannot be edited"
unless a later accepted decision adds them.

The accepted student enum values are `basic` and `premium` for subscribed plan, and `active`, `paused`, and `canceled`
for status.

## Technical Orientation

The accepted implementation is a TypeScript React SPA, TypeScript Express REST API, PostgreSQL database, Prisma
migrations, and Docker Compose deployment. See `docs/architecture.md` and `docs/adr/` for accepted architecture
decisions.
