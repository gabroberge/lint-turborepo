---
name: fix-nestjs-when-in-suite-title
description: Resolves ESLint nestjs/no-when-in-suite-title violations by naming the suite describe for the file or unit under test and moving the leading when condition into a nested scenario describe. Use when a suite describe title starts with when.
---

# NestJS `when` on the suite describe

`nestjs/no-when-in-suite-title` reports an outermost `describe` whose title starts with the word `when`.

That title is a scenario condition. The suite `describe` names the file or the unit under test. A nested scenario `describe` is where `when …` belongs.

The rule does not autofix. It cannot invent the suite name. There is nothing to apply mechanically before inspecting the file.

## Resolution

When `nestjs/no-when-in-suite-title` reports a `describe`:

1. Read the suite title, the file, and the tests inside that `describe`.
2. Name the suite for the file or the unit under test. Use the `nestjs-test-grammar` skill only to choose that name. Do not invent a unit the file does not show.
3. Keep the existing condition as a scenario `describe` nested directly under that suite. Keep the `when` wording unless it misstates the condition.
4. Preserve setup, actions, assertions, and parameterization.

Stop there. Do not insert a subject `describe`, or any other level, between the suite and the scenario. A missing subject is not this violation.

Do not rename the condition into the suite title and delete the scenario. Do not leave the `when` title on the outermost `describe`.

    describe("Accounts", () => {
        describe("when the account is missing", () => {
            it("returns null", () => {
                ...
            });
        });
    });

## What this rule does not own

- The word `when` in an `it` / `test` title is `nestjs/no-when-in-test-title`. Apply that autofix first when it also reports. Its fixer may wrap a test in `describe("when …")`. If that `describe` is the suite, this rule still applies.
- The word `if` is `nestjs/no-if-in-test-title`. `if` is not mechanically a `when`, and this rule does not flag it.
- A test that sits directly in the suite is `nestjs/no-test-outside-describe`. Nesting and the suite title are different checks. Fixing one does not clear the other.
- Mock and spy setup inside the test is `nestjs/no-arrange-in-test`.

## Ambiguous cases

If the file does not show what the suite should be called, do not invent a name.

Leave the violation and report the ambiguity.

A remaining lint error is preferable to a suite title that does not name the file or the unit.
