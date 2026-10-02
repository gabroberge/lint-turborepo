---
name: fix-nestjs-generic-http-exception-assertion
description: Resolves nestjs/no-generic-http-exception-assertion warnings by determining the behavior each test intends to prove and asserting the contract named by the lint diagnostic. Use when fixing nestjs/no-generic-http-exception-assertion warnings, or when a test asserts a generic HTTP exception type that multiple failure paths can produce.
---

# Generic HTTP exception assertions

`nestjs/no-generic-http-exception-assertion` reports a type-only Nest HTTP exception assertion. The diagnostic names the expected assertion shape. Follow that destination. Do not choose a different repair form.

- `useValidationError` — `*.dto.spec.ts`. Assert `toHaveValidationError(...)` with the validation message of the named failure.
- `useSpecificException` — any other spec. Assert `toThrow(new SpecificException("..."))` when that is the existing contract, or a domain/custom error that already identifies the failure.

A warning is an inspection point. It is not an instruction to invent a message.

## Goal

Make the test fail if the behavior named by the test is removed or implemented incorrectly.

Ask:

> If the behavior named by this test disappeared, could another failure path still satisfy this assertion?

If yes, the assertion does not yet prove the behavior.

The lint rule already chose the assertion shape. This skill answers:

> What is the exact validation message?
>
> What is the precise error contract?
>
> Does the test actually reach that branch?
>
> If production throws `new NotFoundException()` with no distinguishing observable, which message correctly describes that existing branch?

## Process

For each reported test:

1. Read the test title, enclosing describes, setup, production path, and relevant validation/error behavior.

2. Identify the exact behavior the test claims to exercise.

3. Identify every earlier or competing path that could produce the same generic HTTP exception.

4. Ensure the test setup reaches the intended behavior.

    - Satisfy unrelated preconditions.
    - Make unrelated validators or dependencies succeed where necessary.
    - Do not weaken or bypass the behavior under test.

5. Assert using the destination named by the diagnostic, with the existing contract that proves that behavior.

### `useValidationError`

Assert `toHaveValidationError` with the class-validator message of the named rule.

For a property-specific validation test:

- make unrelated properties valid;
- make unrelated asynchronous/custom validators succeed;
- leave only the validation condition under test failing.

Do not assume that receiving `UnprocessableEntityException` proves which validator rejected the DTO.

If the current validation boundary exposes no stable observable that distinguishes the intended failure from unrelated failures, do not manufacture one. Leave the warning and report the limitation.

### `useSpecificException`

When production already throws a concrete exception instance with a stable message, prefer asserting that exception directly:

    await expect(action()).rejects.toThrow(
        new InternalServerErrorException("Failed to cancel refund")
    );

This proves both the exception type and the existing distinguishing message without inventing a new error contract.

Do not replace this with separate type and message assertions unless they prove distinct behaviors.

A domain or custom error type that already identifies the failure is accepted. Use interaction assertions only when the interaction itself is part of the behavior being tested.

If no distinguishing observable exists:

1. Check whether the production branch throws an anonymous generic HTTP exception.
2. If a stable description of that existing failure condition is clear, add it to the exception.
3. Assert the resulting exception contract.
4. If choosing a stable message requires product or domain judgment, leave the warning unresolved and report.

## Do not

- choose a different assertion shape than the diagnostic names;
- mechanically replace every generic exception assertion with a message assertion;
- invent error messages, codes, or contracts;
- assert implementation details merely to silence the rule;
- add mocks that make the test green without proving its stated behavior;
- replace one ambiguous assertion with another ambiguous assertion;
- suppress the warning before understanding why the test is reported.

Do not change production behavior merely to silence the lint rule.

However, if the intended failure path has no distinguishing observable because production throws an anonymous generic HTTP exception, inspect whether adding a stable descriptive message is an appropriate improvement to the existing error contract.

A production change is appropriate only when the message describes an existing failure condition; it must not invent a new behavior or alter control flow.

When doing so, update the production exception and assert that exact existing contract in the test.

## Existing abstractions

Preserve existing test helpers and conventions when they can express the required proof.

`toHaveValidationError` is the DTO convention. Do not introduce a new testing abstraction merely to resolve one warning.

## Ambiguity

If the test title, production behavior, and assertion disagree about what is being tested, do not guess.

Report the ambiguity rather than silently redefining the test.

## Verification

1. `npm run lint` on the touched specs. Every case you resolved has zero `nestjs/no-generic-http-exception-assertion`. Every case you left because no stable distinguishing observable exists still reports the rule, and the diff does not touch it. Leave any other new or nearby violations for their own rule.
2. `npm test -- <affected.spec.ts>` — all tests in modified files pass. Skip this when you did not edit a spec.
3. Review the diff: each repaired test would fail if its named behavior were removed or implemented incorrectly. The setup reaches that behavior. The assertion matches the diagnostic destination. No invented message, no suppressed warning.

## Reporting

Report:

- how many original warnings were inspected;
- how many were repaired and how many remain unresolved;
- the recurring failure categories found;
- for each unresolved warning, the missing distinguishing observable;
- any new failure mode this skill does not cover.

For repaired warnings, summarize recurring repair patterns rather than reporting every test individually.

If a reported test reveals a failure mode this skill does not cover, stop and report the category before continuing the sweep.
