---
name: fix-nestjs-arrange-in-test
description: Resolves ESLint nestjs/no-arrange-in-test violations in Nest/Vitest specs by moving scenario setup out of it into describe/beforeEach without changing the scenario, behavior, or assertion. Use when fixing arrange-in-test lint errors, or when mock configuration, fixtures, or other Arrange lives inside an it or test body.
---

# Fix `nestjs/no-arrange-in-test`

The `nestjs/no-arrange-in-test` rule enforces Ember's unit-test structure:

`describe` → scenario `describe` → `beforeEach` → `it`

A test body should contain the Act and Assert for the behavior being tested. Arrange/setup that establishes the scenario belongs in the surrounding `describe` structure and its `beforeEach`.

## Goal

When fixing a `nestjs/no-arrange-in-test` violation, move setup out of the `it` without changing the scenario, behavior, or assertion.

Do not mechanically move every statement before the Act into a `beforeEach`. Determine which statements establish the scenario and move only those.

## Mock setup

Mock configuration is Arrange and must not live inside `it`.

For example:

```ts
it("should return null", async () => {
    repository.findById.mockResolvedValue(null);

    const result = await underTest.find(...);

    expect(result).toBeNull();
});
```

becomes:

```ts
describe("when the entity is not found", () => {
    beforeEach(() => {
        repository.findById.mockResolvedValue(null);
    });

    it("should return null", async () => {
        const result = await underTest.find(...);

        expect(result).toBeNull();
    });
});
```

This applies to setup such as:

- `mockResolvedValue`
- `mockResolvedValueOnce`
- `mockRejectedValue`
- `mockRejectedValueOnce`
- `mockReturnValue`
- `mockReturnValueOnce`
- `mockImplementation`
- `mockImplementationOnce`
- `vi.spyOn`
- other mock configuration that establishes test preconditions

Do not prefix mock configuration with `void`.

Bad:

```ts
void repository.findById.mockResolvedValue(entity);
```

Good:

```ts
repository.findById.mockResolvedValue(entity);
```

Do not add `await` to synchronous Vitest mock configuration either.

## Remove unnecessary mock setup

Before moving a mock setup statement, determine whether it is needed at all.

Do not preserve setup whose only purpose is to explicitly configure the default behavior already provided by the mock.

For example, this is usually unnecessary:

```ts
service.doSomething.mockResolvedValue(undefined);
```

when the generated/mock implementation already returns `undefined` and the test does not depend on a different behavior.

Delete unnecessary setup instead of moving it into `beforeEach`.

Do not remove setup merely because its return value is not asserted directly. It may be required for the production code to reach the behavior under test.

## Scenario placement

Use the existing `describe` hierarchy to express the precondition.

If the test already belongs to a scenario describe, put scenario-specific setup in that describe's `beforeEach`.

If the setup represents a new condition, introduce or use an appropriate nested scenario describe.

Do not create one `describe` per mock. Describe blocks represent meaningful behavioral conditions, not implementation details.

Bad:

```ts
describe("when repository.findById returns null", () => {
```

Prefer:

```ts
describe("when the transaction is not found", () => {
```

Use the `nestjs-test-grammar` skill to name any new scenario `describe`.

## Property-oriented DTO specs

When working in DTO specs, preserve the established hierarchy:

`DTO` → `property` → `scenario` → `outcome`

If a scenario concerns a property that already has a property-level describe, place the scenario inside that property group.

Bad:

```ts
describe("CreateFeeDto", () => {
    describe("organisationId", () => {
        ...
    });

    describe("when organisationId is missing", () => {
        ...
    });
});
```

Good:

```ts
describe("CreateFeeDto", () => {
    describe("organisationId", () => {
        describe("when organisationId is missing", () => {
            ...
        });
    });
});
```

Do not manufacture property groups or semantic parents merely to satisfy structure.

## Shared setup

Move setup to the narrowest `beforeEach` that accurately represents the scenario.

If several sibling scenarios require the same setup, place it in their nearest meaningful common parent.

Do not hoist scenario-specific setup into a broad parent merely to remove duplication. Doing so changes the implicit preconditions of unrelated tests.

## Values and fixtures

Fixture creation, builders, mutable assignments, and input preparation that establish a scenario are Arrange.

Prefer declaring shared variables in the relevant `describe` and assigning them in its `beforeEach` when the value is part of the scenario.

Do not introduce unsafe casts or artificial abstractions merely to move setup.

Do not create helper functions solely to hide Arrange from the lint rule.

Existing meaningful arrange helpers may remain when they represent a coherent reusable scenario setup.

## Preserve behavior

A fix must not change what the test proves.

After moving setup, verify that the test still reaches the behavior named by its `it`.

In particular, do not assume a passing test is correct merely because it still passes after restructuring.

Ask:

> If I remove the behavior named in the `it`, can this test still pass?

If yes, inspect the setup and assertion before considering the violation fixed.

The final leaf test should normally read as Act + Assert:

```ts
it("should return the transaction", async () => {
    const result = await underTest.find(...);

    expect(result).toEqual(transaction);
});
```

## Scope

While fixing `nestjs/no-arrange-in-test`:

- preserve production behavior;
- preserve assertions unless an existing false positive is exposed;
- remove unnecessary mock configuration when safe;
- remove `void` wrappers around mock configuration;
- do not add `await` to mock configuration;
- do not create generic test-framework abstractions;
- do not perform unrelated readability refactors;
- keep each change local to the test structure required by the violation.

After the changes, run the affected specs and lint the affected files.
