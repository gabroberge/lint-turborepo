---
description: Resolve remaining nestjs/no-when-in-test-title violations that require semantic judgment.
globs:
    - "**/*.spec.ts"
alwaysApply: false
---

# NestJS `when` in test titles

A test condition belongs in `describe` context; the `it` / `test` title should describe the outcome.

When resolving `nestjs/no-when-in-test-title`:

1. Run the ESLint autofix first.
2. Do not manually redo transformations already handled by the autofix.
3. If a violation remains, use the `fix-nestjs-when-in-test-title` skill to inspect why it could not be transformed safely.

A remaining violation is an inspection point, not an instruction to force the test into a particular structure.

Preserve test behavior. Leave unrelated test-quality and structural issues to their own rules and skills.
