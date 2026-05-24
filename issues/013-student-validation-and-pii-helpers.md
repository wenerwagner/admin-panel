# Add Student Validation and PII Helpers

## Status

Proposed

## Related ADRs / Docs

- [ADR-003](../docs/adr/ADR-003-student-domain-model-and-entity-definitions.md)
- [ADR-005](../docs/adr/ADR-005-pii-and-lgpd-compliance-controls.md)

## Objective

Implement pure helper logic for CPF, phone, email normalization, enum mapping, and PII masking.

## Scope

- Validate and normalize CPF.
- Reject repeated-digit CPF values.
- Validate CPF check digits.
- Parse and format Brazilian phone numbers with `libphonenumber-js`.
- Normalize email.
- Mask email, CPF, and phone for list responses.
- Define Zod student schemas.

## Out of Scope

- Student database queries.
- Student API routes.

## Dependencies

- [007-backend-error-handling](007-backend-error-handling.md)

## Expected Changes

- `apps/api/src/utils/cpf.ts`
- `apps/api/src/utils/phone.ts`
- `apps/api/src/utils/mask-pii.ts`
- `apps/api/src/schemas/student.schema.ts`
- `apps/api/tests/unit/cpf.test.ts`
- `apps/api/tests/unit/phone.test.ts`
- `apps/api/tests/unit/mask-pii.test.ts`
- `apps/api/tests/unit/student-schema.test.ts`

## Test Cases

- Given formatted CPF, when normalized, then only digits are stored.
- Given invalid CPF check digits, when validated, then validation fails.
- Given repeated-digit CPF, when validated, then validation fails.
- Given Brazilian phone input, when normalized, then E.164-style output is produced.
- Given email input with spaces and uppercase, when normalized, then it is lowercased and trimmed.
- Given PII values, when masked, then list-safe values are returned.

## How to Test

```sh
npm test --workspace apps/api -- cpf
npm test --workspace apps/api -- phone
npm test --workspace apps/api -- mask-pii
npm test --workspace apps/api -- student-schema
```

## Acceptance Criteria

- [ ] CPF validation covers check digits and repeated digits.
- [ ] Phone normalization is tested.
- [ ] PII masking helpers are tested.
- [ ] Zod schemas reject invalid sensitive fields.
