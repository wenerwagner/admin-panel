# Architecture

This application is a simple containerized student management admin panel. It uses a three-layer architecture:

- **Frontend:** React single-page application built with Vite and TypeScript.
- **Backend:** Express REST API written in TypeScript.
- **Database:** PostgreSQL accessed only by the backend through Prisma.

The frontend communicates with the backend only through the REST API. The backend is the only application layer that
connects to PostgreSQL, and Prisma migrations manage schema changes.

## Repository Layout

The project uses a lightweight monorepo layout:

```text
apps/
  web/
  api/
docker-compose.yml
docs/
```

Shared internal packages are intentionally avoided for now. They should be introduced only when repeated code or shared
contracts justify the extra structure.

## Deployment

Docker Compose is the local development, evaluation, and initial deployment model. The full application must run with:

```sh
docker compose up
```

The initial deployment runs the frontend, backend, and PostgreSQL as containerized services on a single host.
PostgreSQL uses a persistent Docker volume.

The React application is built as static assets and served by Caddy. Caddy may also reverse proxy `/api` requests to the
backend so the deployed application can use a single public web origin.

## References

Architecture decisions are documented in [docs/adr](adr/).

<!-- This architecture.md file should keep a reference for the ADRs. They should be listed separated by status-->

### Draft

- [ADR-001 - Application Architecture and Technology Stack](adr/ADR-001-application-architecture-and-technology-stack.md)
- [ADR-002 - Authentication and Authorization Strategy](adr/ADR-002-authentication-and-authorization-strategy.md)
- [ADR-003 - Student Domain Model and Entity Definitions](adr/ADR-003-student-domain-model-and-entity-definitions.md)
- [ADR-004 - REST API Design and Naming Conventions](adr/ADR-004-rest-api-design-and-naming-conventions.md)
- [ADR-005 - PII and LGPD Compliance Controls](adr/ADR-005-pii-and-lgpd-compliance-controls.md)
