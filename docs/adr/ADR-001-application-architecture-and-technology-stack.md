---
title: Application Architecture and Technology Stack
type: architecture
status: draft
date: 2026-05-23
authors:
  - Wener Castro <wenerwagner@gmail.com>
tags: [architecture, stack, frontend, backend, database, deployment]
area: admin-panel
---

# ADR-001 - Application Architecture and Technology Stack

* **Status:** Draft
* **Date:** 2026-05-23
* **Authors:** Wener Castro <wenerwagner@gmail.com>

## Context

The project is an administrative student management panel for Escola do Breno. It is a focused internal CRUD
application where administrators can sign in and manage student records.

The product should stay intentionally simple. There are no current requirements for student lifecycle workflows,
business-rule state machines, scheduled jobs, audit logs, or complex deployment infrastructure.

Some constraints were defined before this decision:

* The frontend and backend must use TypeScript.
* The database must be PostgreSQL.
* The project must use Docker Compose.
* The complete application must run with `docker compose up`.

Student records include sensitive personal data, so security and privacy requirements influence the architecture.
Specific authentication, authorization, validation, testing, and PII-handling decisions are outside the scope of this
ADR and will be addressed separately.

## Decision

We will build the application as a simple containerized three-layer web application:

* A React single-page application built with Vite and TypeScript.
* An Express backend API written in TypeScript.
* A PostgreSQL database accessed by the backend through Prisma.

The frontend and backend will live in a single repository using a lightweight monorepo layout:

```text
apps/
  web/
  api/
docker-compose.yml
docs/
```

The project will not introduce shared internal packages initially, to keep the structure simple and avoid abstractions
before there is proven duplication.

The backend will expose a REST API for authentication and student management. The frontend will communicate with the
backend only through this API.

The backend will be the only application layer allowed to access PostgreSQL. Prisma migrations will manage database
schema changes.

Docker Compose will be used for local development, project evaluation, and the initial deployment model. The initial
deployment will run the frontend, backend, and PostgreSQL as containerized services on a single host. PostgreSQL will
initially run as a Docker Compose service with a persistent volume.

For deployment, the React application will be built into static assets and served by Caddy. Caddy may also act as the
reverse proxy to the backend API. The deployed application will expose a single public web origin, with `/api` requests
proxied to the backend service.

The specific hosting provider is outside the scope of this ADR.

## Considered Options

1. **Simple containerized three-layer application**
   * *Pros:* Simple to understand, aligns with the existing constraints, supports one-command setup, and keeps the UI,
     API, and persistence responsibilities clear.
   * *Cons:* The initial deployment model is limited to a single host and does not provide high availability by itself.

2. **Single full-stack framework application**
   * *Pros:* Could reduce the number of runtime applications and consolidate routing, rendering, and API behavior.
   * *Cons:* Does not match the desired explicit separation between frontend and backend concerns, and is unnecessary
     for a small internal CRUD panel with a REST API.

3. **Microservices or event-driven architecture**
   * *Pros:* Can support independent service scaling and asynchronous workflows when a domain requires them.
   * *Cons:* Adds operational and design complexity that is not justified by the current domain, which has one primary
     actor and one primary managed resource.

4. **Serverless deployment**
   * *Pros:* Can reduce server management and scale individual functions on demand.
   * *Cons:* Conflicts with the explicit Docker Compose requirement and adds provider-specific deployment decisions
     before they are needed.

## Consequences

### Positive

* Local setup and initial deployment remain simple through Docker Compose.
* The system has a clear separation between UI, API, and persistence.
* TypeScript is used across frontend and backend.
* REST keeps the backend interface easy to inspect, document, and exercise manually.
* PostgreSQL and Prisma provide an explicit schema and migration workflow.
* Serving the frontend with Caddy supports a simple single-origin deployment with `/api` reverse proxying.

### Negative / Trade-offs

* Docker Compose on a single host is not highly available.
* Frontend and backend are versioned and deployed together initially.
* A React SPA does not provide server-side rendering.
* Express provides less built-in structure than more opinionated frameworks such as NestJS.
* Caddy adds a reverse proxy component that must be configured and operated.

## Deferred Decisions

The following decisions are intentionally left to later ADRs or implementation documents:

* Authentication mechanism.
* Authorization model.
* Server-side validation rules.
* PII handling and LGPD-specific controls.
* Testing strategy.
* Detailed student data modeling, including field constraints and deletion behavior.
* Production hosting provider.
* Migration from Compose-managed PostgreSQL to managed PostgreSQL, if needed.

## References

* [Product documentation](../product.md)
* [Architecture overview](../architecture.md)
* [ADR template](../templates/ADR-000-template.md)
