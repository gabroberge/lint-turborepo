---
name: fix-nestjs-inherited-property-test-matrix
description: Resolves ESLint nestjs/no-inherited-property-test-matrix violations in Nest/Vitest specs by keeping detailed behavioral coverage on the type that owns a property and reducing subclass coverage to meaningful composition or wiring behavior.
---

# NestJS inherited property test matrices

Detailed behavioral coverage belongs to the type that declares the property.

A subclass may need to prove that inherited behavior composes correctly with its own contract, but it should not reproduce the declaring type's behavioral test matrix.

A lint finding is an inspection point. Do not mechanically delete every reported test.

## Resolution

When `nestjs/no-inherited-property-test-matrix` reports inherited-property coverage:

1. Read the subclass spec and identify what the reported tests are trying to prove.
2. Inspect the declaring type and its relevant tests to understand where the inherited behavior is owned.
3. Separate detailed inherited behavior from subclass composition behavior.
4. Remove subclass tests that only repeat behavior already owned by the declaring type.
5. Keep or reshape subclass coverage when it proves meaningful composition of inherited and subclass-owned behavior.

For one inherited property, at most one isolated wiring or smoke case should normally remain in the subclass spec.

## Composition

A useful subclass test proves something about the assembled subclass contract, not another point in the inherited property's validation matrix.

For example, a subclass may prove that a valid inherited property is accepted together with behavior owned by the subclass.

Do not keep several inherited-property cases merely because they use different values.

Do not invent subclass-specific meaning for a test whose behavior is entirely inherited.

## Test ownership

Prefer:

    declaring type
        → detailed behavioral matrix

    subclass
        → subclass-owned behavior
        → meaningful composition with inherited behavior
        → at most one isolated wiring case per inherited property when useful

A subclass does not need to prove every inherited invariant again.

If the declaring type lacks adequate coverage, do not preserve duplication in the subclass as a substitute. Treat the missing owner coverage as a separate concern.

## Inspection

Before removing or retaining a reported test, ask:

    What behavior would this test protect that is specific to the subclass or to composition?

If there is no meaningful answer, the test is probably redundant.

If a reported test appears to exercise subclass-specific behavior despite targeting an inherited property, inspect it rather than deleting it mechanically.

Do not force an ambiguous case green. If ownership or the intended composition behavior cannot be determined confidently, leave the violation and report the ambiguity.
