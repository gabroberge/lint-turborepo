---
name: fix-nestjs-test-outside-describe
description: Resolves ESLint nestjs/no-test-outside-describe violations in Nest/Vitest specs by nesting each reported test inside a describe below the suite describe. Title splitting applies only when moving a real condition out of the test title, not for structural nesting alone.
---

# NestJS tests outside a nested describe

`nestjs/no-test-outside-describe` reports an `it` / `test` that is outside every `describe`, or written directly inside the outermost suite `describe`.

The rule counts nesting. It does not read titles. A nested `describe` satisfies the rule whether or not that title names a subject, a scenario, or a condition. The `nestjs-test-grammar` skill names that `describe`.

This skill owns placement one level below the suite. Structural nesting does not, by itself, require rewriting the test title or inventing a `when` scenario. Apply title splitting only when the test title clearly encodes a condition that belongs in a scenario `describe`, as `nestjs/no-when-in-test-title` would — and only after that rule's autofix has run when it applies.

The goal is not to add nesting. The goal is a grammatically coherent level: an existing nested `describe`, or the smallest nested `describe` the grammar can name, without duplicating the same words in both the `describe` and the `it` / `test` title.

## What the rule detects

- A bare `it` / `test`.
- An `it` / `test` whose only enclosing `describe` is the outermost one.
- `it.each`, `test.each`, `it.for`, and the other supported modifiers, on the same terms. The call that receives the title is the test. `it.skipIf(condition)` and `it.each(table)` are not.
- A helper is judged where the `it` / `test` call is written. A `describe` that calls the helper does not nest that call.

A `describe` written around the test counts, including `describe(SomeClass, …)`. `describe.each` counts as a `describe`. There is no maximum depth.

## Resolution

For each reported test:

1. Read the test body, title, surrounding `describe` blocks, setup, and nearby tests.
2. If a `describe` already inside the suite is the right home for this test, move the test there. Keep its title unless that would duplicate the enclosing `describe`.
3. Otherwise, choose the nested `describe` using the `nestjs-test-grammar` skill. Follow this order:
    - **Subject or thematic group** when the title states a behavioral outcome or category and there is no separable condition — for example the suite already names the function, or an `it.each` table shares one behavior. Name the group for the shared subject or theme. The `it` / `test` title may stay unchanged.
    - **Scenario `describe`** only when the test is clearly about behavior under a condition the title or body establishes — not merely because a concrete fixture value appears in the body.
4. Rewrite the `it` / `test` title only when the new `describe` now carries condition or context that would be repeated in the title. If the describe names a subject or theme, the original title usually stays.
5. Preserve the test's setup, action, assertions, parameterization, and behavioral meaning.

Do not treat `nestjs/no-when-in-test-title` remediation as the default shape for this rule. Do not wrap a test in `describe("when …")` only to satisfy nesting.

### Subject wrapper (structural nesting, no condition to extract)

    describe("formatPhoneNumber", () => {
        describe("supported inputs", () => {
            it.each([...])("should format %s as %s", (phoneNumber, expected) => {
                ...
            });
        });
    });

The inner `describe` is not a scenario. The parameterized title stays.

### Thematic group (behavioral category preserved)

    describe("evaluateDeviceIssueRecoveryEligibility", () => {
        describe("immutability", () => {
            it("should be a pure function of its context", () => {
                ...
            });
        });
    });

Do not replace a category such as "pure function" with `describe("when the context is evaluated")` and a weaker outcome title.

### When title splitting is appropriate

Use a scenario `describe` and a shorter outcome-only `it` / `test` title when the existing title clearly joins a **condition** and an **outcome**, and moving the condition into the `describe` removes duplication:

    it("should not be valid with a string shorter than the minimum length", ...);

should not become:

    describe("when the string is shorter than the minimum length", () => {
        it("should not be valid with a string shorter than the minimum length", ...);
    });

If the body establishes that the observable outcome is an `UnprocessableEntityException`, prefer:

    describe("when the string is shorter than the minimum length", () => {
        it("should throw UnprocessableEntityException", ...);
    });

The new title must describe what the test actually observes. Do not invent a stronger outcome merely to make the title shorter. Do not replace a behavioral category in the original title with a literal fixture or expected value unless the test is genuinely parameterized by that scenario.

### Do not manufacture vacuous scenarios

Avoid `when` phrases that restate calling the subject or an obvious success path:

- `when the phone number can be formatted`
- `when the context is evaluated`
- `when every gate passes` (unless sibling tests are already grouped by real gate structure you are joining)

Avoid one `describe` per incidental input value when the original titles described categories (`should format large amount correctly`) rather than that literal input (`when the amount is 123456`).

Do not solve the violation by renaming the suite and leaving the test directly inside it. The outermost `describe` is the suite whatever its title is.

    describe("AccountService", () => {
        it("returns the account", () => {
            ...
        });
    });

That test is still reported.

Do not create a `describe` whose only purpose is to make the lint error disappear.

## Preserve the test

Moving a test under a nested `describe` must not change what it proves.

Do not:

- change fixtures merely to fit a new grouping;
- change mocks or setup;
- change assertions;
- rename the behavioral outcome into something broader or weaker than the test proves;
- invent a scenario that the test does not establish;
- move setup into `beforeEach` merely because a new `describe` was introduced;
- merge tests merely because their new context is shared.

## Parameterized tests

Treat `it.each`, `test.each`, `it.for`, and equivalent supported forms as tests with the same nesting requirement.

Preserve the parameterization. The nested `describe` wraps the whole table and names the shared subject or scenario of the table, not one row.

Do not convert between `it.each` and `describe.each` merely to satisfy this rule. Other rules own parameterization structure. The test grammar skill names that `describe`.

## Ambiguous cases

If the grammar skill cannot name a nested `describe` confidently, do not invent one.

Leave the violation and report the ambiguity.

A remaining lint error is preferable to meaningless structure.

## Scope

This remediation owns one structural result:

    A `describe` inside the suite, with a name chosen by the test grammar skill, and an `it` / `test` whose title is unchanged or shortened only when the new `describe` carries condition or context that would otherwise be duplicated.

Title splitting is not required for structural nesting alone. It applies when extracting a real condition from the test title into a scenario `describe`.

Do not expand the change into unrelated test cleanup.

Other rules own concerns such as:

- a suite title that starts with `when`;
- the word `when` in an `it` / `test` title (`nestjs/no-when-in-test-title`);
- arrange inside the test body;
- missing or weak assertions;
- identical test bodies;
- single-case parameterization;
- inherited-property coverage.

If restructuring exposes one of those problems, let the corresponding rule or skill handle it.
