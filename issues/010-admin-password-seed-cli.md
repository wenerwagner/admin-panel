# Add Admin Password Hashing and Seed/Create Command

## Status

Proposed

## Related ADRs / Docs

- [ADR-002](../docs/adr/ADR-002-authentication-and-authorization-strategy.md)
- [ADR-003](../docs/adr/ADR-003-student-domain-model-and-entity-definitions.md)

## Objective

Support intentional admin creation for local/evaluation and production-like operation.

## Scope

- Add Argon2 password hashing wrapper.
- Add admin creation seed or CLI command.
- Normalize admin email.
- Prevent silent password overwrite when admin email exists.
- Document local admin credentials or command in README.

## Out of Scope

- Public registration.
- Admin management UI.
- Password reset.

## Dependencies

- [006-prisma-schema-and-migrations](006-prisma-schema-and-migrations.md)

## Expected Changes

- `apps/api/src/lib/argon2.ts`
- `apps/api/prisma/seed.ts` or `apps/api/src/scripts/create-admin.ts`
- `apps/api/tests/unit/argon2.test.ts`
- `apps/api/tests/integration/admin-seed.test.ts`

## Test Cases

- Given a password, when hashed, then plaintext is not stored and verification succeeds.
- Given an existing admin email, when seed/create runs, then it does not overwrite the password silently.
- Given an uppercase email, when admin is created, then email is stored lowercased.

## How to Test

```sh
npm test --workspace apps/api -- admin
npm run seed --workspace apps/api
```

## Acceptance Criteria

- [ ] Admin passwords use Argon2.
- [ ] Admin email normalization is tested.
- [ ] Duplicate admin creation behavior is safe and explicit.
