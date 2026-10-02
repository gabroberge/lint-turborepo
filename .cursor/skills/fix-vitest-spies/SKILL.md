---
name: fix-vitest-spies
description: Fix violations of the Vitest vi.spyOn lifecycle rule without changing test semantics.
---

# Fix Vitest spies

Use this skill when fixing lint violations requiring `vi.spyOn(...)` to be created in `beforeEach`.

The goal is not to reorganize or clean up the surrounding test suite. Make the smallest semantic-preserving change that puts the spy in the correct lifecycle scope.

## Core invariant

Every `vi.spyOn(...)` must execute in a `beforeEach`.

The spy may currently appear inside an `it`, `test`, `describe`, or another scope. Its current location does not make that location valid.

## Before changing anything

Read the complete surrounding test context.

Determine:

1. why the spy exists
2. whether it changes behavior, observes behavior, or both
3. which tests require it
4. which scenario owns the setup
5. whether the spy is necessary at all

Do not mechanically move every surrounding statement with the spy.

## If the test needs the spy reference

Move only the declaration outside the test and create the spy in the narrowest relevant `beforeEach`.

Before:

```ts
it("should call the method", async () => {
	const methodSpy = vi.spyOn(service, "method");

	await service.execute();

	expect(methodSpy).toHaveBeenCalled();
});
```

After:

```ts
let methodSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	methodSpy = vi.spyOn(service, "method");
});

it("should call the method", async () => {
	await service.execute();

	expect(methodSpy).toHaveBeenCalled();
});
```

## If the reference is not needed

Do not create a variable.

Before:

```ts
it("should return the result", async () => {
	vi.spyOn(service, "find").mockResolvedValue(result);

	await expect(underTest.execute()).resolves.toEqual(result);
});
```

After:

```ts
beforeEach(() => {
	vi.spyOn(service, "find").mockResolvedValue(result);
});

it("should return the result", async () => {
	await expect(underTest.execute()).resolves.toEqual(result);
});
```

## Preserve scenario ownership

Setup belongs to the narrowest behavioral scenario that requires it.

Prefer:

```ts
describe("when the account exists", () => {
	beforeEach(() => {
		vi.spyOn(service, "find").mockResolvedValue(account);
	});

	it("should return the account", async () => {
		// Act + Assert
	});
});
```

Do not hoist this spy to a parent `beforeEach` if sibling scenarios require different behavior.

Do not create a `describe` named after the spy, mock, dependency, or implementation detail. If a new `describe` is required, it must describe the behavioral condition established by the setup.

## Preserve test semantics

Moving a spy must not silently change:

- its mocked return value
- its mocked rejection
- its implementation
- its call-through behavior
- fixture values
- test inputs
- assertions
- expected exceptions
- which scenario receives the mocked behavior

Pay particular attention when moving setup into an existing parent `beforeEach`. The spy must not accidentally affect sibling tests that did not previously use it.

If moving the spy would require choosing between materially different behaviors, stop and report the case instead of guessing.

## Remove unnecessary setup

A violation does not imply that the spy must survive.

If the test passes through the intended behavior without the spy and does not assert against it, determine whether it is unnecessary setup.

Remove unnecessary spies rather than relocating them.

Do not remove a spy merely because its return value is not directly asserted. It may be necessary for execution to reach the behavior under test.

## Interaction with no-arrange-in-test

Follow the existing test grammar:

```text
describe
→ behavioral scenario describe
→ beforeEach
→ it: Act + Assert
```

Do not hide Arrange in helper functions merely to satisfy lint.

Fixture creation, assignments, mock configuration, and other scenario setup should follow the existing `no-arrange-in-test` conventions.

## Validation

After each logical group of fixes:

1. run the affected specs
2. run the relevant lint
3. inspect the diff

Use this review question:

> If I remove the behavior named in the `it`, can this test still pass?

If yes, the test may already have an effectiveness problem. Do not silently redesign it as part of this skill; report it unless the required correction is obvious and directly related to the violation.

## Scope discipline

Do not perform unrelated cleanup.

Do not:

- reorganize unrelated describes
- parameterize tests
- rename unrelated tests
- alter production code
- weaken assertions
- change fixtures for convenience
- introduce helper abstractions
- refactor mocks unrelated to the violation

Fix the violation at the narrowest correct scope and move on.
