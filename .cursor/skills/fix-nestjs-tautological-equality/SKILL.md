---
name: fix-nestjs-tautological-equality
description: Resolves ESLint nestjs/no-tautological-equality violations in Nest/Vitest specs by making the assertion independently capable of detecting a regression, not by manufacturing a different expected value from the actual. Use when fixing tautological equality lint errors, or when a test compares a value with itself or with a sole spread of itself.
---

# Fix `nestjs/no-tautological-equality`

## Core idea

The lint rule is mechanical. The remediation may require judgment.

A tautological assertion is evidence that the test is not observing the behavior it claims to protect.

The goal is NOT:

`expect(x).toEqual(x)` → mechanically manufacture a different expected value

The goal is:

`tautological assertion` → determine what observable behavior the test intended to prove → make the assertion independently capable of detecting a regression

A good repair should answer:

"If the behavior named by this test were removed or implemented incorrectly, would this assertion now fail?"

If not, the test is still not repaired.

## What the rule detects

The rule flags `toBe` / `toEqual` / `toStrictEqual` when the actual and expected expressions are syntactically the same side-effect-free value, including:

- same identifier or literal (`expect(result).toEqual(result)`, `expect(1).toBe(1)`)
- same safe member read (`expect(result.data).toEqual(result.data)`)
- a sole object or array spread of that same value (`expect(result).toEqual({ ...result })`, `expect(items).toEqual([...items])`)
- those shapes with transparent wrappers (`as`, `satisfies`, `!`, parentheses)
- `.not` before the matcher (`expect(result).not.toEqual(result)`)

It does **not** flag different identifiers, aliases (`const expected = result`), calls (`getValue()`), non-equality matchers, `.resolves` / `.rejects`, `toEqualEntity`, or a spread that adds another property or element. Do not treat those as violations of this rule. Do not "fix" a reported tautology by introducing one of those shapes merely to go green.

## Decision workflow

1. Read the test title, surrounding `describe`s, setup, act, and assertion.
2. Determine the behavioral outcome the test claims to observe.
3. Ask what change to the production behavior should make this test fail.
4. Determine whether the current assertion can observe that change.
5. Repair the assertion using an independently derived expected outcome when the intent is clear.
6. If the assertion is redundant because another assertion in the same test already proves the intended behavior, remove only the redundant assertion.
7. If the test itself has no meaningful observable behavior left after removing the tautology, investigate whether the test should be repaired or removed.
8. If the intended observable contract cannot be determined confidently, leave the violation and report the ambiguity rather than inventing an expected value.

Fix mechanically when the intended behavior and correct observable assertion are obvious from the local test.

Investigate when the title, scenario, action, and available observable outcomes disagree.

When the evidence is insufficient, do not invent a contract merely to make ESLint green.

## Repair when intent is clear

Derive the expected value independently from the scenario and the observable contract: explicit fixture inputs, constants established by the scenario, the title, the surrounding `describe`s, or an externally defined expected outcome.

Do not calculate the expected value by reproducing the implementation under test. If determining the expected result requires reimplementing the production algorithm and the contract is not otherwise expressed by the test, treat the intent as unclear.

```ts
it("maps the input name to an active record", () => {
	const result = mapRecord({ name: "Ada" });
	expect(result).toEqual({ name: "Ada", status: "active" });
});
```

Preserve one behavioral invariant per test where that is the existing structure.

If another assertion in the same test already proves that invariant, delete only the tautology.

## Suspicious fixes that must not be used merely to clear lint

```ts
expect(result).toEqual({ ...result });
expect(result).toEqual({ ...result, extra: true });
expect(result).toEqual(structuredClone(result));
expect(result).toEqual(JSON.parse(JSON.stringify(result)));
expect(result).toBeDefined();
const expected = result;
expect(result).toEqual(expected);
expect(result.total).toBe(result.subtotal + result.tax);
```

The last line looks like a real assertion, but all three values come from the result. Production can break the calculation and keep an internally consistent relation.

Do not replace a tautology with another assertion that is technically non-tautological but equally meaningless.

Do not derive the expected value from the actual value under test.

Do not copy the implementation into the test merely to create an expected value.

Do not add arbitrary assertions just to satisfy lint.

Do not weaken an assertion.

Do not change production code.

## Unresolved example

```ts
describe("when the mapper runs", () => {
	it("returns the mapped record", () => {
		const result = mapRecord(input);
		expect(result).toEqual(result);
	});
});
```

The title names a mapped record. The assertion cannot fail if mapping is wrong. If the spec does not show what the mapped record must contain, do not invent fields. Leave the violation and report that the expected shape is missing.

## Forbidden shortcuts

- Do not disable or suppress `nestjs/no-tautological-equality`.
- Do not reimplement the production algorithm to manufacture an expected value.
- Do not fix unrelated lint violations encountered nearby.
- Do not reorganize unrelated test contexts.

If the chosen fix exposes another lint violation or test smell, leave it for the corresponding rule/skill.

## Verification

1. `npm run lint` on the touched specs. Every case you resolved has zero `nestjs/no-tautological-equality`. Every case you left because its intent is not clear still reports the rule, and the diff does not touch it. Leave any other new or nearby violations for their own rule.
2. `npm test -- <affected.spec.ts>` — all tests in modified files pass. Skip this when you did not edit a spec.
3. Review the diff: each repaired test would fail if its named behavior regressed. No expected value was derived from the actual. No tautology was replaced with a clone, spread, serialize round-trip, or defined/truthy check.

## Reporting

For every original violation, report:

- what behavior the test appears intended to protect;
- why the original test did not prove it;
- whether the result was repaired, removed as redundant, or left unresolved;
- what observable outcome now makes the test fail when that behavior regresses.

For unresolved violations, state the conflicting or missing evidence. Do not propose an arbitrary expected value just to clear the lint.
