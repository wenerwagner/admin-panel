# AGENTS.md

Instructions for AI coding agents working in this repository.

## Lookup Map

Check the known entry point before using repo-wide search.

| Topic mentioned | Read first |
| --- | --- |
| ADR, architecture decision, accepted decision | `docs/adr/`, then `docs/architecture.md` |
| Product, requirements, scope, glossary | `docs/product.md`, then `CONTEXT.md` |
| Domain context, modeling notes, project orientation | `CONTEXT.md`, then `docs/product.md` |
| Engineering process, branches, PRs, CI, testing commands | `docs/engineering.md` |
| Open question, deferred decision, production unknown | `docs/open-questions.md` |
| Setup, running the app, delivered scope | `README.md` |

Use repo-wide search only after checking the relevant known entry point above.

## Architecture And ADRs

- Accepted architecture decisions live in `docs/adr/` and are summarized in `docs/architecture.md`.
- New ADRs go in `docs/adr/` and should use `docs/adr/ADR-000-template.md`.
- Agents may create draft ADRs to propose architecture changes.
- Agents must not mark ADRs as accepted, change accepted architecture, or implement architecture-changing work unless
  the user explicitly approves the decision or the change is already approved in an accepted ADR.
- When creating or changing an ADR, update `docs/architecture.md` if the accepted architecture summary changes.
- Do not override an accepted ADR silently. If implementation conflicts with an accepted ADR, follow the ADR or propose
  a draft ADR/update for approval.
- If a GitHub Issue requires changing accepted architecture or making a new architecture decision, do not implement that
  part until the decision is explicitly approved or captured in an accepted ADR.

## Scope Guardrails

- Keep the app focused on the accepted v1 scope: admin login and student CRUD.
- Do not add new workflows, dependencies, services, roles, deployment processes, or business rules just because they
  seem useful.
- Track deferred or unresolved decisions in `docs/open-questions.md`, not only in chat, commits, or PR descriptions.
- Do not duplicate large sections of docs across files. Prefer linking to the source document.
- Update `CONTEXT.md` only when stable domain context, v1 scope, vocabulary, modeling notes, or technical orientation
  changes. Do not use `CONTEXT.md` for session plans, temporary implementation notes, issue progress, or PR status.

## GitHub Issue Workflow

Before implementation work, read and follow `docs/engineering.md`.

When the user says "implement issue N", use that issue. When the user says "implement the next issue" or "implement an
issue" without a number, choose the lowest-numbered active GitHub Issue. An active issue is open and is not labeled
`blocked`, `deferred`, `duplicate`, or `wontfix`.

Use GitHub CLI (`gh`) for reading issues and creating PRs when available. If `gh` is unavailable or unauthenticated,
report that and ask how to proceed.

Before editing files for issue implementation:

- Check the current branch and worktree status.
- If there are uncommitted changes not made by the agent for the current task, do not create a branch or start
  implementation. Ask the user how to proceed.
- Ensure the issue branch is created from up-to-date `main`. If `main` cannot be updated from `origin/main`, stop before
  creating the issue branch and report the reason.
- Create a short-lived branch using `feat/issue-N-short-name`, `fix/issue-N-short-name`,
  `docs/issue-N-short-name`, or `chore/issue-N-short-name`.
- Read `CONTEXT.md`, `docs/engineering.md`, the selected issue, and any lookup-map docs relevant to the issue.
- State the selected issue, goal, branch name, relevant docs read, and planned checks in the session.

During issue implementation:

- Treat the GitHub Issue as the implementation request, but treat accepted ADRs, `docs/architecture.md`, and
  `docs/product.md` as constraints. If the issue conflicts with accepted docs, stop and ask before implementing.
- Keep changes scoped to the issue.
- Add or update tests when the issue changes behavior that should be protected. Follow `docs/engineering.md` and ADR-009
  for test priority.
- Do not edit, close, label, assign, milestone, or comment on GitHub Issues unless explicitly asked.
- Do not create new GitHub Issues unless explicitly asked. Mention discovered follow-up work in the session or PR body.
- If the same check failure or implementation blocker remains after 3 focused fix attempts, stop and ask whether to keep
  trying, change approach, reduce scope, or leave the failure documented.

At completion:

- Use `docs/engineering.md` as the source for required checks and workflow. Use `README.md` for setup and run
  instructions.
- If commands are missing or disagree, report the gap and use the safest available command from package scripts or
  existing CI config.
- If required checks fail, investigate and fix failures related to the changes, then rerun the checks. If failures are
  unrelated, pre-existing, or cannot be resolved without changing scope, report them and ask before creating a PR.
- For issue implementation, agents may create scoped commits on the issue branch. Commit messages should be imperative
  and concise.
- Create a ready-for-review PR by default when required checks pass and GitHub access is available.
- If checks cannot run or are knowingly incomplete and the user still wants a PR, create a draft PR and clearly state the
  limitation in the PR body.
- Use `.github/pull_request_template.md` when creating PRs.
- Link the PR with `Refs #N` by default. Use `Closes #N`, `Fixes #N`, or `Resolves #N` only when the user explicitly
  asks for automatic issue closure on merge.
- Agents may push the issue branch to origin when creating or updating the PR. Agents must not push directly to `main`.
- Do not assign reviewers, assign users, add labels, set milestones, change project fields, merge PRs, or delete local
  or remote branches unless explicitly asked.

When the user requests adjustments to an agent-created PR, continue on the same issue branch and update the same PR. If
the user disagrees with the PR direction, first summarize the disagreement, identify affected files or decisions, and
propose the smallest correction plan before editing.

## Documentation Updates

When a change affects documented behavior, commands, architecture, product scope, or deferred decisions, update the
relevant doc in the same change.

- Product scope or glossary: `docs/product.md`, and possibly `CONTEXT.md`
- Accepted architecture summary: `docs/architecture.md`
- Architecture decisions: new or updated ADR in `docs/adr/`
- Engineering commands or process: `docs/engineering.md`
- Deferred or unknown decisions: `docs/open-questions.md`
- Setup, running, or delivered scope: `README.md`
