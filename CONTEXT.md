CONTEXT.md should have:

- [X] Domain glossary (problem-domain vocabulary, not code terminology)
- [ ] Modeling decisions (why these entities, fields, and relationships were chosen)
- [ ] This is not a README regurgitation. It is the document another person (human or AI agent) would read to understand
  the domain in 5 minutes.

## Glossary

<!-- It should be in sync with the /docs/product.md glossary -->

- Admin: Authorized user who can access the management panel and perform student CRUD operations.
- Student: Person enrolled or represented in Breno School's administrative records.
- CPF: Brazilian individual taxpayer registry number. Treated as sensitive personal data.
- Phone number: Student contact number. Treated as sensitive personal data.
- Subscribed plan: The student's commercial plan, such as `basic` or `premium`.
- Status: Current administrative state of a student record, such as `active`, `canceled`, or `paused`. The status is
  descriptive only; it must not imply business-rule transitions unless explicitly added later.
- CRUD: Create, read, update, and delete operations for student records.