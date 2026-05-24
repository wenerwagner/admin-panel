# Add API Environment Configuration

## Status

Proposed

## Related ADRs / Docs

- [ADR-002](../docs/adr/ADR-002-authentication-and-authorization-strategy.md)
- [ADR-010](../docs/adr/ADR-010-backend-folder-structure-and-module-architecture.md)

## Objective

Validate backend environment variables at startup with Zod.

## Scope

- Add `env.ts`.
- Parse and validate required environment variables.
- Provide safe local defaults only where ADR-002 allows them.
- Fail fast on invalid production config.

## Out of Scope

- Secret generation automation.
- Production operations runbook.

## Dependencies

- [002-api-typescript-express-scaffold](002-api-typescript-express-scaffold.md)

## Expected Changes

- `apps/api/src/config/env.ts`
- `apps/api/tests/unit/env.test.ts`
- `.env.example`

## Test Cases

- Given required env vars are missing, when config loads, then startup fails with a clear error.
- Given valid env vars, when config loads, then parsed config contains typed values.
- Given production mode with insecure cookie settings, when config loads, then invalid settings are rejected.

## How to Test

```sh
npm test --workspace apps/api -- env
npm run build --workspace apps/api
```

## Acceptance Criteria

- [ ] Backend config is parsed through one module.
- [ ] Required variables from ADR-002 are represented.
- [ ] Unit tests cover valid and invalid config.
