# Engineering

## Purpose

This document defines the development process for this repository. The project is intentionally simple, so the process
should show clear engineering discipline without adding unnecessary ceremony.

Architectural decisions belong in ADRs. Unresolved or intentionally deferred decisions belong in
[open questions](open-questions.md). Concrete implementation tasks are tracked in
[GitHub Issues](https://github.com/wenerwagner/admin-panel/issues).

## Repository Workflow

`main` is the only long-lived branch. It should remain buildable and ready to release.

Work should happen in short-lived branches created from `main`. Suggested branch names are descriptive and scoped, for
example:

```text
feat/student-list
fix/login-session
docs/engineering-process
```

The project should not use permanent `develop`, `staging`, or `release/*` branches while the repository remains small.
If the project grows enough to require a more formal release flow, that decision should be recorded before changing the
branching model.

## Branching

Required branches:

* `main`

Allowed temporary branches:

* `feat/*`
* `fix/*`
* `docs/*`
* `chore/*`

Temporary branches should be deleted after merge.

## Pull Requests and Reviews

Pull requests are preferred for changes to `main`.

Small direct commits to `main` are acceptable only for documentation-only or setup work before CI exists. Once CI exists,
changes should go through pull requests unless there is a clear reason not to.

Each pull request should include:

* a short summary of the change
* tests or checks performed
* documentation updates, when behavior or commands changed
* deferred decisions added to [open questions](open-questions.md), when applicable

Behavior changes should update related docs or issue descriptions when the change affects documented expectations.

Squash merge is the preferred merge style for this repository because it keeps `main` readable.

## Commits

Commit messages should be imperative and concise.

Examples:

```text
Add student list endpoint
Document engineering process
Fix session expiration handling
```

Conventional Commit prefixes such as `docs:` or `fix:` are allowed but not required.

## Work Tracking

GitHub Issues is the active tracker for implementation work.

The local `issues/` directory was removed after its drafts were migrated. New implementation work should be opened in
GitHub Issues, not added as local issue draft files.

## Deferred Decisions

Any known decision that is intentionally postponed must be recorded in [open questions](open-questions.md). Do not leave
unresolved decisions only in commit messages, pull request descriptions, local issue files, or chat history.

Each deferred entry should include:

* status
* date
* owner
* context
* question or recommendation
* decision needed before

Use `Open` for unresolved decisions, `Deferred` for intentionally postponed recommendations, and `Answered` once a final
answer is known.

## Versioning and Tags

The project uses simple semantic version tags:

* `v0.x.0` for development milestones
* `v1.0.0` for the first complete deliverable
* `v1.0.x` for fixes after `v1.0.0`

Release notes may be written manually from merged pull requests and the release checklist. Automated changelog generation
is not required.

## Local Development

Exact commands must be documented once the application scaffold and scripts exist. Until then, the required command
categories are:

* install dependencies
* start the local stack
* run lint
* run TypeScript typecheck
* run tests
* build the API and web apps
* validate Docker Compose configuration
* run database migrations
* reset or seed local development data
* create or seed an admin user

The README should contain the shortest setup path for a clean checkout. This document should contain the broader
engineering workflow and command reference.

## Quality Gate

Before merging code into `main`, the following checks should pass once the related scripts exist:

* formatting or lint
* TypeScript typecheck
* backend tests
* frontend build
* Docker Compose configuration validation
* committed migrations for schema changes

Coverage percentage thresholds are not required for v1.

## Testing

The testing strategy is defined in [ADR-009](adr/ADR-009-testing-strategy.md). For v1, the highest priority is backend
and API behavior around authentication, authorization, validation, persistence, and PII handling.

Frontend tests are optional in v1 unless a focused test protects behavior that would otherwise be risky to verify.
End-to-end browser tests are not required in v1. A manual happy-path check is sufficient before release.

## Database Migrations

Database schema changes must be made through Prisma migrations.

Rules:

* schema changes must include committed migrations
* migrations are reviewed like application code
* shared or merged migrations should not be edited after other developers or environments may have applied them
* local reset, seed, and test database commands must be documented once implemented

The production migration procedure is deferred until the production deployment target is defined.

## Environment Variables and Secrets

The project should maintain `.env.example` files once environment variables exist.

Rules:

* never commit real secrets
* local development may use safe example defaults
* production secrets must be generated and provided outside Git
* required variables should be documented near the app that consumes them and summarized here
* CI secrets must live in the CI provider's secret store

Unresolved production secret handling decisions must be tracked in [open questions](open-questions.md).

## CI/CD

GitHub Actions is the intended CI provider.

CI is planned but not implemented yet. Once implemented, CI should run on pull requests and pushes to `main`.

The CI workflow should run the merge quality gate once the required scripts exist:

* lint or format check
* typecheck
* tests
* build
* Docker Compose validation

Deployment automation is intentionally deferred. CI should validate the project before `main` is changed, but it should
not deploy to production until the production target, secrets strategy, and deployment procedure are defined.

CI/CD does not require a dedicated ADR for this project unless the deployment model becomes more complex.

## Deployment

The current deployment stance is intentionally minimal.

Docker Compose is the expected deployment shape, consistent with
[ADR-001](adr/ADR-001-application-architecture-and-technology-stack.md). Automated deployment is not defined yet.

The production target, domain and HTTPS procedure, backup and restore procedure, incident response process, and detailed
production migration flow remain deferred decisions tracked in [open questions](open-questions.md).

## Release Checklist

Before creating a release tag:

* `main` is up to date
* the quality gate passes
* README setup instructions are current
* engineering docs list the actual implemented commands
* open questions do not block the release
* migrations are committed if the schema changed
* the manual happy-path check is completed
* create a semantic version tag such as `v1.0.0`
* add short release notes
