---
description: The questions should have context, dates, owners, statuses
---

# Open Questions

## Data Retention and LGPD Operations

* **Status:** Open
* **Date:** 2026-05-24
* **Owner:** Business/legal owner
* **Context:** ADR-005 defines engineering controls for PII and LGPD-related risk, but it does not define the legal or
  operational policy.
* **Question:** What are the retention periods for active students, soft-deleted students, backups, and manual exports?
* **Decision needed before:** Real production use with real student data.

## Production Operations Runbook

* **Status:** Open
* **Date:** 2026-05-24
* **Owner:** Technical/operator owner
* **Context:** ADR-001 defines Docker Compose, Caddy, and PostgreSQL as the initial deployment model, but the exact
  host/provider and operational procedures are not defined.
* **Question:** What are the production procedures for HTTPS, domains, backup, restore, deployment, database exposure,
  and incident response?
* **Decision needed before:** Real production deployment.

# Recommendations

## CI/CD Strategy

* **Status:** Deferred
* **Date:** 2026-05-24
* **Owner:** Technical owner
* **Recommendation:** Do not create a CI/CD ADR until implementation scripts exist. First document actual commands in
  `docs/engineering.md`, such as lint, typecheck, API tests, build, and Compose validation.

## Database Migration and Seed Strategy

* **Status:** Deferred
* **Date:** 2026-05-24
* **Owner:** Technical owner
* **Recommendation:** Do not create a dedicated ADR now. Prisma, migrations, seed/admin creation constraints, and
  partial unique index concerns are already covered by ADR-001, ADR-002, and ADR-003. Document exact migration, seed,
  and test database reset commands in `docs/engineering.md` after scaffolding.

## Frontend UI and Component Library

* **Status:** Deferred
* **Date:** 2026-05-24
* **Owner:** Technical/frontend owner
* **Recommendation:** Leave the UI/component library open during ADR review unless a substantial framework such as MUI,
  Ant Design, shadcn/ui, or Tailwind is intentionally selected. If the implementation uses simple CSS and local
  components, document that in engineering docs or amend ADR-011 later.

## Environment Variables and Secrets Handling

* **Status:** Deferred
* **Date:** 2026-05-24
* **Owner:** Technical/operator owner
* **Recommendation:** Keep environment variable examples, `.env.example`, local defaults, production secret generation,
  and Docker Compose wiring in `docs/engineering.md` for now. ADR-002 already defines the main backend environment
  variables.

## Admin Creation CLI

* **Status:** Deferred
* **Date:** 2026-05-24
* **Owner:** Technical owner
* **Recommendation:** Keep the exact CLI command, arguments, password prompt behavior, and local seed credentials in
  `README.md` and `docs/engineering.md` once implemented. ADR-002 already defines the architectural rule: no public
  registration, no automatic production default admin, and explicit production admin creation.

# Previously Answered Questions

## ADR Scope for Current Review

* **Status:** Answered
* **Date:** 2026-05-24
* **Owner:** Wener Castro <wenerwagner@gmail.com>
* **Answer:** Create six additional draft ADRs for API documentation/OpenAPI, backend logging, application error
  handling, testing, backend folder structure, and frontend folder structure. Keep CI/CD, migration runbooks, UI library
  selection, environment/secrets handling, production operations, and admin CLI details outside the ADR set for now.
