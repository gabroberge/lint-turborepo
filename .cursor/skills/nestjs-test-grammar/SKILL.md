---
name: nestjs-test-grammar
description: Applies the Nest/Vitest lexical test grammar for suite, subject, and scenario describe blocks, beforeEach scenario setup, and it/test behavioral outcomes. Use when naming or restructuring describe blocks, choosing a subject versus a scenario, or when another Nest test skill defers naming to this grammar.
---

# Nest test grammar

This skill names `describe` blocks. It does not re-apply a lint check that already has a rule.

The grammar is:

    suite describe    = file / overall suite
    nested describe   = specific subject or scenario
    scenario describe = condition
    beforeEach        = scenario setup
    it/test           = behavioral outcome

The outermost `describe` is the suite. It names the file or the unit under test. A nested `describe` is a subject `describe` or a scenario `describe`. A subject `describe` names the operation being exercised or a thematic group of tests. A scenario `describe` names a condition that can vary. A subject `describe` does not have to start with `when`. `beforeEach` arranges the scenario of the `describe` that contains it. The `it` / `test` title states the behavioral outcome.

The goal is not to add nesting. The goal is to make the structure communicate the behavior already represented by the test.

Do not add a level that does not name something the test already establishes.

## Subject versus scenario

Prefer a subject `describe` when the test is primarily about an operation or a shared behavioral theme.

    describe("formatValue", () => {
        it("returns the formatted value", () => {
            ...
        });
    });

Prefer a scenario `describe` when the test is primarily about behavior under a condition:

    describe("when the value is missing", () => {
        it("returns null", () => {
            ...
        });
    });

Both may be appropriate when the suite needs both levels:

    describe("resolve", () => {
        describe("when the value is missing", () => {
            it("returns null", () => {
                ...
            });
        });
    });

Do not add both levels mechanically. Use the structure needed to describe the existing behavior clearly.

For example, if the suite names a service and several tests exercise different methods, the method is usually the missing subject:

    describe("AccountService", () => {
        describe("getAccount", () => {
            it("returns the account", () => {
                ...
            });
        });
    });

If the suite already names the operation under test, do not assume a scenario is required. Prefer a subject or thematic nested `describe` when tests share the same operation but no distinguishing condition — for example `describe("supported inputs", () => { it.each(...) })` under `describe("formatPhoneNumber", ...)`. Add a scenario `describe` only when the test is clearly about behavior under a condition that varies.

## Nesting-only fixes (`no-test-outside-describe`)

When the only problem is that an `it` / `test` sits directly in the suite, satisfying the rule needs one nested `describe`. That level may be a subject or theme; it does not have to be `when …`.

Do not invent a condition merely to create the extra level. Do not split the test title unless a real condition moves into a scenario `describe`. See the `fix-nestjs-test-outside-describe` skill.

## Vacuous scenarios

A `when …` describe should add information. Phrases equivalent to "when the function is called", "when the value is evaluated", or "when the value can be formatted" are generally not meaningful scenarios, because exercising the subject is already implicit in the test.

Do not use a scenario `describe` when a subject or thematic name communicates the structure better.

## Fixture values versus scenarios

A boundary or semantically meaningful category can be a scenario. An incidental example value in the test body should stay an implementation detail unless the file already groups by that kind of condition.

Do not turn each literal input into `describe("when the amount is 1250", …)` when the original title described a category (`should format large amount correctly`). Prefer one subject group, `it.each`, or a scenario that names the category (`when the amount is large`), not the arbitrary fixture.

## Preserve title semantics when splitting

When moving a condition from an `it` / `test` title into a `describe`, keep the outcome accurate and preserve useful category wording from the original title.

Do not replace a behavioral category with a weaker literal-output description unless the old title is contradicted by the test body.

## Group related tests

When several tests exercise the same specific subject, group them under one subject `describe` rather than creating one `describe` per test.

When several tests represent variants of the same scenario, use a shared scenario `describe` when that accurately represents them.

Do not group tests merely because they are adjacent. Their shared `describe` must name actual shared context.

Do not duplicate an existing context deeper in the tree.

For a parameterized test, the `describe` names the shared subject or scenario represented by the table, not one individual row.

## Scenario setup

`beforeEach` arranges the scenario of its enclosing `describe`. Do not move setup into `beforeEach` merely because a `describe` was introduced or renamed.

Mock and spy setup inside an `it` / `test` belongs to `nestjs/no-arrange-in-test`. Leave it there. Do not treat other statements as setup unless that rule reports them.

## Already enforced elsewhere

Do not re-decide these. Each one has its own rule and, where the fix is not mechanical, its own skill:

- `nestjs/no-test-outside-describe` — the test is nested below the suite `describe`. Titles are irrelevant to that rule.
- `nestjs/no-when-in-suite-title` — the suite title starts with `when`.
- `nestjs/no-when-in-test-title` — the word `when` in an `it` / `test` title. Apply its autofix first.
- `nestjs/no-if-in-test-title` — the word `if` in an `it` / `test` title. `if` is not mechanically a `when`.
- `nestjs/no-arrange-in-test` — mock and spy setup inside the test.
- `nestjs/ordered-dto-test-groups` — DTO suite children are setup, then `when` groups, then property groups alphabetically. Apply its autofix first.

## Ambiguous names

If the test does not reveal a specific subject or scenario confidently, do not invent one.

Inspect nearby tests and the production API being exercised.

If the intended name still cannot be determined confidently, leave the structure unchanged and report the ambiguity.

A remaining lint error is preferable to a `describe` that does not mean anything.
