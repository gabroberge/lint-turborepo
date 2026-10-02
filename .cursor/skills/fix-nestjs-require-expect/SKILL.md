---
name: fix-nestjs-require-expect
description: Resolves ESLint nestjs/require-expect violations in Nest/Vitest specs by observing the named behavior, or determining the test should not exist. Use when fixing missing-expect lint errors, or when an it/test callback contains no expect call in its own body.
---

# Fix `nestjs/require-expect`

## Core idea

The lint rule is mechanical. The remediation may require judgment.

Executing code without observing an outcome is not an automated behavioral proof.

The goal is NOT:

`test has no expect` → add any `expect`

The goal is:

`test has no expect` → determine what behavior the test intended to prove → either observe that behavior explicitly or determine that the test should not exist

A good repair should answer:

"What production regression would make this test fail?"

If there is no specific answer, the test is not repaired.

## What the rule detects

Every executable `it` / `test` callback must contain an `expect` call **directly in its own body**. Ordinary `if` / `for` / `try` in that body counts. Traversal stops at a nested function: an `expect` inside an arrow, function expression, function declaration, `forEach`, or `map` callback does not satisfy the rule, even if that helper is invoked. That is a syntactic limitation, not a finding that the test is unasserted.

What counts as `expect` for the lint: `expect(...)`, `expect.assertions(...)`, `expect.hasAssertions()`. Only the identifier `expect` is recognized.

Exemptions: `it.todo` / `test.todo`, and `it` / `test` (including modifiers) with no callback.

Still required when a callback exists: `.skip`, `.only`, `.concurrent`, `.each`, `.for`, `.fails`, and similar.

An `expect` in `beforeEach` / `beforeAll`, an outer helper, or a nested `it` / `test` does not satisfy this rule. Callbacks passed by identifier (`it("title", myTest)`) are not inspected. Custom helpers not named `expect` do not count.

`expect.assertions` / `expect.hasAssertions` satisfy the **lint**. They are not a semantic repair unless a behavioral assertion also observes the named outcome.

## Decision workflow

1. Read the test title, surrounding `describe`s, setup, and actions.
2. Determine what observable contract the test claims to protect.
3. Inspect what the action actually exposes: return value, thrown/rejected error, state change, persisted state, emitted output, or meaningful collaborator interaction.
4. Choose the cheapest observable outcome that directly proves the named behavior.
5. Add an assertion only when the intended contract is clear.
6. If a reusable helper already owns that behavioral assertion, leave the violation rather than moving or duplicating the `expect`.
7. If the test duplicates behavior already protected by another test, consider removing the redundant test rather than manufacturing an assertion.
8. If the test title claims behavior that the current setup/action never reaches, repair the scenario rather than asserting an earlier unrelated outcome.
9. If the intended contract cannot be determined confidently, leave the violation and report the ambiguity.

Fix mechanically when the intended behavior and correct observable assertion are obvious from the local test.

Investigate when the title, scenario, action, and available observable outcomes disagree.

When the evidence is insufficient, do not invent a contract merely to make ESLint green.

## Repair when intent is clear

Assert the named outcome. Derive the expected value from the scenario, not from leftover setup data.

```ts
it("creates a pending record", async () => {
	const record = await underTest.create();
	expect(record.state).toBe("pending");
});
```

If the behavioral assertion lives inside a nested or reusable helper, do not automatically move or duplicate it merely to satisfy the lint rule.

First determine whether the helper is intentionally an assertion abstraction.

- If the helper only hides incidental test structure and the assertion is clearer in the test body, move the assertion into the test.
- If the helper intentionally owns a reusable behavioral assertion, do not add a duplicate assertion or dismantle the abstraction just to satisfy the rule. Leave the violation and report that the test is semantically asserted through a helper that the mechanical rule cannot inspect.

The lint rule's inability to perform interprocedural analysis is not evidence that the test lacks an assertion.

```ts
it("persists the transaction", async () => {
	await executeAndExpectPersistedTransaction();
});
```

Interaction assertions are appropriate when the interaction itself is part of the behavior being specified. Do not add mock-call assertions merely to prove that execution reached a line.

## Meaningless assertions that must not be used

```ts
expect(true).toBe(true);
expect(result).toBeDefined();
expect(create).toHaveBeenCalled();
expect(input).toEqual(input);
```

Do not use:

- `expect(true).toBe(true)`
- `expect(result).toBeDefined()` when the test claims a specific result
- asserting a mock was called only because it happened to be called
- asserting setup data against itself
- `expect.assertions(...)` solely to satisfy the rule without a behavioral assertion
- unrelated state that happens to exist after the action

## False-positive test intent

A test named for behavior B may currently execute behavior A and stop there. Do not add an assertion for A just because it is easy to observe. Repair the scenario so B is reached, then assert B.

```ts
it("notifies the billing client after failure", async () => {
	await underTest.run();
	expect(underTest.run).toHaveBeenCalled();
});
```

The title names a collaborator notification. Asserting that `run` was called proves only that the test invoked its own subject. Arrange the failure path, then assert the billing client interaction (or the resulting state) the title names.

## Unresolved example

```ts
it("handles the request", async () => {
	await underTest.execute();
});
```

The title does not name an outcome. The action exposes nothing the spec describes. Do not pick a return value, a mock call, or `toBeDefined()` to go green. Leave the violation and report that the intended contract is missing.

## Forbidden shortcuts

- Do not disable or suppress `nestjs/require-expect`.
- Do not convert `it.todo` into an executable test merely to add an assertion.
- Do not dismantle a reusable assertion helper, or add a duplicate `expect` beside it, just to satisfy the rule.
- Do not change production code.
- Do not fix unrelated lint violations encountered nearby.
- Do not reorganize unrelated test contexts.

If the chosen fix exposes another lint violation or test smell, leave it for the corresponding rule/skill.

## Verification

1. `npm run lint` on the touched specs. Every case you resolved has zero `nestjs/require-expect`. Every case you left — unclear intent, or a reusable helper the rule cannot inspect — still reports the rule, and the diff does not touch it. Leave any other new or nearby violations for their own rule.
2. `npm test -- <affected.spec.ts>` — all tests in modified files pass. Skip this when you did not edit a spec.
3. Review the diff: each repaired test would fail if its named behavior regressed. No dummy `expect`, no `expect.assertions` as the only assertion, no assertion for an earlier unrelated outcome.

## Reporting

For every original violation, report:

- what behavior the test appears intended to protect;
- why the original test did not prove it;
- whether the result was repaired, removed as redundant, or left unresolved;
- what observable outcome now makes the test fail when that behavior regresses.

For unresolved violations, state the conflicting or missing evidence. If the test is asserted through a helper the rule cannot inspect, say that. Do not propose an arbitrary assertion just to clear the lint.
