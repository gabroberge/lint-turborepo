# Test grammar

These roles describe how a Nest/Vitest spec is read. They are not one lint rule. Each enforceable slice has its own detection and its own remediation. Naming that a rule cannot see stays a judgment.

```
suite describe    = file / overall suite
nested describe   = specific subject or scenario
scenario describe = condition
beforeEach        = scenario setup
it/test           = behavioral outcome
```

The outermost `describe` is the suite. It names the file or the unit under test. A nested `describe` is either a subject `describe` or a scenario `describe`. A subject `describe` names the operation being exercised. A scenario `describe` names the condition, usually `when …`. `beforeEach` arranges the scenario of the `describe` that contains it. The `it` / `test` title states the behavioral outcome.

There is no maximum depth. Use the levels the behavior needs. Do not add a level that does not name something the test already establishes.

## Subject versus scenario

Prefer a subject `describe` when the test is primarily about an operation.

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

A subject `describe` does not have to start with `when`. A scenario `describe` is the condition. The mechanical marker for that condition is a title whose first word is `when`. Other condition wording is a judgment.

## Group related tests

When several tests exercise the same specific subject, group them under one subject `describe` rather than creating one `describe` per test.

When several tests represent variants of the same scenario, use a shared scenario `describe` when that accurately represents them.

Do not group tests merely because they are adjacent. Their shared `describe` must name actual shared context.

Do not duplicate an existing context deeper in the tree.

## What is enforced

### `nestjs/no-test-outside-describe`

Structural nesting only. Each `it` / `test` must be written inside a `describe` that is itself inside the suite `describe`. A bare test, and a test whose only `describe` is the outermost one, are reported.

The rule does not read titles. Any nested `describe` satisfies it. It does not decide subject versus scenario, and it has no autofix.

### `nestjs/no-when-in-suite-title`

The suite title must not start with the word `when`. A title in that form is a scenario condition. Nested `describe("when …")` is the expected place for that word and is not reported.

No autofix. The suite name is the file or the unit under test, and the rule cannot invent it. A `when` that is not the first word (`describe("Accounts when empty")`) is not this form and is not reported. `whenever` is not `when`.

### `nestjs/no-when-in-test-title`

Owns the word `when` in an `it` / `test` title. The condition moves to a `describe` title; the test title keeps the behavioral outcome. The fixer performs that split when it is deterministic. It does not invent a suite name. A `when` title it creates on the outermost `describe` can still be `no-when-in-suite-title`.

### `nestjs/no-if-in-test-title`

Owns the word `if` in an `it` / `test` title. `if` is not mechanically a `when`. The rule asks for inspection. It does not flag `describe` titles. Do not add a second rule that treats `if` in a `describe` as the same marker as `when`.

### `nestjs/no-arrange-in-test`

Owns mock and spy setup written inside an `it` / `test`: the calls listed on that rule. Those calls arrange the scenario and belong in `beforeEach`. The rule does not require a `beforeEach`, and it does not classify the enclosing `describe`. Fixture construction, `new`, and other assignments stay in the test when they cannot be told apart from the act.

### `nestjs/ordered-dto-test-groups`

Owns the order of direct children of a DTO suite `describe` in `*.dto.spec.ts`: setup, then DTO-level `when` describes in source order, then property describes alphabetically. Nested `describe` blocks are not reordered. Autofix performs that reorder when every child can be classified. It does not rename titles or regroup tests.

## What stays a judgment

These are part of the grammar and are not separate lint rules, because the source does not show them reliably:

- Whether a nested `describe` is a subject or a scenario, when the title does not start with `when`.
- What the suite should be called. The file or the unit under test is context, not a string the linter can recover.
- Whether a `beforeEach` holds the right scenario setup, beyond the mock and spy calls `no-arrange-in-test` already reports. A `beforeEach` directly in the suite may arrange the unit for every subject. That is not a violation.
- Whether an `it` / `test` title is a behavioral outcome, beyond the words `when` and `if`, which already have rules.
- Whether sibling tests share a subject or a scenario.
- A `describe` added only so a nesting error disappears.

`if` at the start of a suite title is not flagged. `no-if-in-test-title` already decided that `if` is not a mechanical condition marker, including in `describe` titles.
