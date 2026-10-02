---
name: fix-nestjs-if-in-test-title
description: Resolves ESLint nestjs/no-if-in-test-title violations in Nest/Vitest specs by separating behavioral outcomes from conditions when the test structure supports it. Use when fixing if-in-test-title lint errors, or when an it or test title contains an if clause.
---

# NestJS `if` in test titles

An `if` in an `it` / `test` title is an inspection point.

A condition belongs in a scenario `describe`. The `it` / `test` title states the behavioral outcome. Suite, subject, and scenario roles are the `nestjs-test-grammar` skill. This skill only interprets `if`.

`if` is not mechanically equivalent to `when`. Do not rewrite the title by string manipulation alone.

For example:

    it("should return null if no supported payment method details are present", ...)

normally expresses:

    describe("when no supported payment method details are present", () => {
        it("should return null", ...);
    });

## Resolution

When `nestjs/no-if-in-test-title` reports a test:

1. Read the complete test and its surrounding `describe` context.
2. Determine what behavior the test is intended to prove.
3. Determine what the `if` clause represents in that behavior.
4. If it represents scenario context or a precondition, move that meaning into an appropriate `describe` and leave the `it` / `test` title as the observable outcome.
5. Preserve the test's behavior, setup, action, and assertions unless the inspection reveals that the existing test does not actually prove its stated behavior.
6. If the conditional wording is genuinely part of the behavioral outcome and restructuring would distort the test's meaning, leave the test unchanged and suppress the rule locally with a concise explanation.

Do not restructure unrelated neighboring tests merely for consistency.

## Preserve semantic meaning

The resulting structure should describe the actual scenario represented by the test.

Do not blindly transform:

    "<outcome> if <condition>"

into:

    describe("when <condition>", ...)

The wording may need to change to accurately describe the scenario.

Do not invent a condition that is not established by the test.

Do not change fixtures, mocks, production code, or assertions merely to satisfy this rule.

## Inspection

After restructuring, verify that the test actually reaches and observes the behavior named by its new structure.

Ask:

    If the behavior named by this test were removed or implemented incorrectly,
    would this test fail for that reason?

If an unrelated earlier path can satisfy the assertion, leave that concern to the rule or skill responsible for test effectiveness. Do not expand this remediation into unrelated test cleanup.

## Suppression

A local suppression is valid when the test has been inspected and conditional wording is intentionally the clearest representation of the behavior.

Include a concise explanation for why the conditional title is intentional.

Do not suppress the rule merely because restructuring is inconvenient.

Do not force an ambiguous case green. If the intended behavioral structure cannot be determined confidently, leave the violation and report the ambiguity.
