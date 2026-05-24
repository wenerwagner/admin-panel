# Issues

This folder contains temporary GitHub-ready issue drafts for implementing the application from the accepted architecture
baseline.

Use [000-issue-template.md](000-issue-template.md) for new issues. The numbered files are ordered by dependency and are
intended to keep PRs slim. GitHub Issues is the preferred long-term tracker; these local drafts should be migrated once
the GitHub repository issue tracker is ready.

## Import Order

1. [001 - Scaffold Root Monorepo Structure](001-root-monorepo-scaffold.md)
2. [002 - Scaffold API TypeScript Express App](002-api-typescript-express-scaffold.md)
3. [003 - Scaffold Web Vite React App](003-web-vite-react-scaffold.md)
4. [004 - Add Docker Compose Local Stack](004-docker-compose-local-stack.md)
5. [005 - Add API Environment Configuration](005-api-env-config.md)
6. [006 - Add Prisma Schema and Initial Migration](006-prisma-schema-and-migrations.md)
7. [007 - Add Backend Error Handling Foundation](007-backend-error-handling.md)
8. [008 - Add Backend Logging and Request IDs](008-backend-logging-request-id.md)
9. [009 - Add Backend Test Harness with PostgreSQL](009-backend-test-harness.md)
10. [010 - Add Admin Password Hashing and Seed/Create Command](010-admin-password-seed-cli.md)
11. [011 - Implement Auth Session Endpoints](011-auth-session-endpoints.md)
12. [012 - Add CSRF Protection and Login Rate Limit](012-csrf-and-login-rate-limit.md)
13. [013 - Add Student Validation and PII Helpers](013-student-validation-and-pii-helpers.md)
14. [014 - Add Student Repository and Service](014-student-repository-service.md)
15. [015 - Implement Student Read API](015-student-read-api.md)
16. [016 - Implement Student Write API](016-student-write-api.md)
17. [017 - Add OpenAPI Specification and Local Swagger UI](017-openapi-local-docs.md)
18. [018 - Add Frontend API Client, Types, and Error Mapping](018-frontend-api-client-and-types.md)
19. [019 - Implement Frontend Auth Flow](019-frontend-auth-flow.md)
20. [020 - Implement Frontend Student List](020-frontend-student-list.md)
21. [021 - Implement Frontend Student Create and Edit Forms](021-frontend-student-form-create-edit.md)
22. [022 - Implement Frontend Student Delete Flow](022-frontend-student-delete-flow.md)
23. [023 - Complete README, CONTEXT, and Engineering Docs](023-readme-context-engineering-docs.md)
24. [024 - Final Evaluation Pass](024-final-evaluation-pass.md)
25. [025 - Add GitHub Actions CI Workflow](025-github-actions-ci.md)
26. [026 - Migrate Local Issue Drafts to GitHub Issues](026-migrate-local-issues-to-github.md)

## Coverage Map

- Must-have admin login: issues 010-012 and 019.
- Must-have student CRUD: issues 013-016 and 020-022.
- Sensitive-field validation: issues 013, 016, and 021.
- Authorization tests: issues 011, 012, 015, and 016.
- `docker compose up` from scratch: issues 004 and 024.
- README, CONTEXT, and ADR-backed docs: issues 023 and 024.
- CI workflow: issue 025.
- GitHub issue tracker migration: issue 026.
- Nice-to-have search/filter: issues 015 and 020.
- Nice-to-have soft delete: issues 006, 014, 016, and 022.
- Nice-to-have API tests: issues 009, 011, 012, 015, and 016.
