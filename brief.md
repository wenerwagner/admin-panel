# Technical Test - Senior Fullstack Developer

## What We Are Evaluating (and What We Are Not)

You are **not** being evaluated on:
- Coding speed
- Number of delivered features
- UI polish

You **are** being evaluated on:
1. How you organize a greenfield project
2. How you document architectural decisions (ADRs)
3. How you model the domain (`CONTEXT.md`)
4. How you handle sensitive data (PII)
5. How you use AI in the development workflow

## What You Will Build

An **administrative student management panel** for Breno School.

Features:
- Admin login
- List students
- Add student
- Edit student data
- Delete student

There are **no business rules regarding students.** Focus on a clean, well-modeled, and secure CRUD application. Do not invent status transitions, workflows, or rules like “cannot edit canceled students.” If you feel tempted to do so, stop and document in an ADR why you decided not to.

### Student Entity

Minimum required fields:
- name
- email
- CPF
- phone number
- subscribed plan (suggestion: `basic`, `premium`)
- status (suggestion: `active`, `canceled`, `paused`)

You may add other fields if you consider them relevant. **Justify the modeling in an ADR.**

## Required Stack

- **TypeScript** (frontend and backend)
- **PostgreSQL**
- **Docker Compose** (the entire setup must run with `docker compose up`)

### The Rest Is Your Choice

Frameworks (Next.js, Express, Fastify, Hono, Vite, etc.), ORM (Prisma, Drizzle, Kysely, raw SQL), libraries, folder organization, authentication strategy: **your decision**. **Document it in an ADR.**

## About AI Usage

We actively use **Claude Code** in the workflow. We also expect you to use AI (Claude Code, Cursor, Copilot, ChatGPT, or any other tool).

We do not hide AI usage, and we do not expect you to hide it either.

**What we evaluate:**
- The final repository
- The ADRs
- The `CONTEXT.md`
- Code organization and discipline

**What we do NOT evaluate:**
- Your AI sessions
- How many prompts you used
- How much code was generated vs manually written

Mention in the README which primary AI tool you used. This is only for context and does not influence the evaluation.

**Optional reference** for structuring your AI workflow: [mattpocock/skills](https://github.com/mattpocock/skills).

## Deliverables

A **public GitHub repository** containing:

### Code
- Frontend in TypeScript
- Backend in TypeScript
- PostgreSQL database
- Everything orchestrated by `docker-compose.yml`

### Documentation

**`README.md`** at the project root containing:
- One-command setup (`docker compose up` must bootstrap everything from scratch)
- How to access the admin account (test credentials, automatic seed, or command)
- Summary of what was delivered: completed must-have items, completed nice-to-have items, and out-of-scope items
- Which primary AI tool you used

**`CONTEXT.md`** at the project root:
- Domain **glossary** (problem-domain vocabulary, not code vocabulary)
- Modeling decisions (why these entities, fields, and relationships)
- This is not a regurgitation of the README. It is the document another person (human or AI agent) would read to understand the domain in 5 minutes.

**ADRs (Architecture Decision Records)** in `docs/adr/`:
- Minimum of **2**, no maximum
- Free format, but each ADR must contain: **context, decision, alternatives considered, consequences**
- ADRs are records of **real decisions**, not documentation of obvious choices. “Using TypeScript” is not an ADR (it is already mandatory). “Using Drizzle instead of Prisma because X” is an ADR.
- Suggested topics: chosen stack, authentication strategy, schema modeling, folder organization, validation strategy, what was cut and why.

### Tests
- **Validation** and **authorization** logic must be tested.
- There is no need to test React/frontend components or achieve high coverage. Focus on what matters: what validates CPF? who can access what? are the rules correct?

## Must-have

- [ ] Admin login (any strategy: cookie, JWT, session)
- [ ] Complete student CRUD: list, add, edit, delete
- [ ] Server-side validation for sensitive fields (CPF, email, phone number)
- [ ] Tests for validation and authorization logic
- [ ] `docker compose up` working from scratch
- [ ] README + CONTEXT.md + ≥ 2 ADRs

## Nice-to-have

- Filters and search in the listing
- Soft delete instead of hard delete (with ADR justification)
- Configured linting
- API tests
- Additional ADRs

## Out of Scope (Do Not Build)

- Audit log / edit history
- Business rules regarding students (status transitions, “cannot edit canceled students,” etc.)
- Triggers, jobs, scheduled workflows
- State machines
- Fancy UI / branding / polished design

## How to Deliver

1. Create a **public** GitHub repository.
2. Make all commits in the repository. **Commit history is part of the delivery.**
3. The README must contain a one-command setup working from scratch.

## Questions?

If something in this brief is ambiguous: **make the decision yourself and document it in an ADR.** That is part of the test — senior developers make decisions with incomplete information.

If something blocks your progress completely (you cannot move forward without an answer), send a message.

Good luck.