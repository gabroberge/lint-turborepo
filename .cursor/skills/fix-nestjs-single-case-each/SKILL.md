---
name: fix-nestjs-single-case-each
description: Resolves ESLint nestjs/no-single-case-each violations in Nest/Vitest specs by asking why a one-case it.each, test.each, or describe.each exists. Inline only when the title, context, and input agree. When those signals conflict and this test's intent is not clear, leave the violation and report it instead of inventing a contract. Use when fixing single-case .each lint errors, or when an it.each, test.each, or describe.each contains only one statically known case.
---

# Fix `nestjs/no-single-case-each`

## Core idea

The lint rule is mechanical. The remediation is not.

The rule only says that an `it.each`, `test.each`, or `describe.each` has a static table of length 1. One array element is one case, including a one-row tuple such as `[[42]]` or `[[1, 2]]`. A one-case table is structurally suspicious. It does not say which edit is true.

Someone chose a table. That can be accidental. It can also be what is left of a matrix that was supposed to carry several representatives. Inlining the only value makes the rule pass either way, and it freezes whichever reading the current input happens to have.

The goal is not:

`single-case .each` → always remove `.each`

The goal is:

`single-case .each` → why is there only one case? → change the test only when that answer is clear

Determine the observable contract **this test** appears intended to protect. Stay inside its title, its `describe`, its sibling tests in the same spec, and the case itself. Do not establish that contract from a parent DTO, from another spec, or from the current validators. Production code can explain why an input passes or fails. It should not choose the contract.

A value that fails exactly one decorator is a probe for that decorator. It is not automatically a better case. Inputs that fail through different internal checks can still belong together when the test's own claim is "none of these is valid".

## When to inline without further digging

Inline directly when the signals already agree. The title names one boundary, the `describe` names that same boundary or adds none, and the only case is that boundary. Further inputs would only repeat the same equivalence class.

```ts
it.each([-1])("should be invalid when quantity is below 0", async (quantity) => {
	await expect(validate({ quantity })).rejects.toBeInstanceOf(UnprocessableEntityException);
});
```

becomes a regular `it` that passes `quantity: -1`. Further negatives such as `-2` repeat the same "below 0" class.

Drop `.each`, write the value where the parameter was used, and replace title placeholders (`%o`, `%s`, `%i`, `%j`, and similar) with that value. Keep modifiers: `it.skip.each` becomes `it.skip`. If the value is a scenario precondition already applied in `beforeEach` or other setup, leave it there. For `describe.each`, keep nested hooks and tests inside the new `describe`.

## When the violation exposes a conflict

Stop treating the edit as mechanical when the local signals disagree. Typical conflict:

```text
describe says: not an integer
input says:    non-numeric string
structure says: parameterized test with one case
```

A copied token is the same kind of conflict. The value names another field, or it was lifted from a neighboring case list, while the title names this field.

Investigate only what this test was likely protecting. Read the title, the surrounding `describe`, the sibling tests in this spec, and the single case. Notice when the title and the case disagree. Use history of this test when it is already at hand, such as a `describe` added to split an identical body. Do not search for a value that fails exactly one validator. Do not go analyze another type's spec to decide this test's contract.

That investigation has three legitimate results:

1. **Accidental `.each`.** The title, the context, and the input name one contract, and further inputs would only repeat it → inline, as above.
2. **Incomplete matrix.** Distinct inputs exercise that same contract, and they do not take over a contract a sibling test already owns → keep `.each` and add the missing representatives. Include inputs that fail through different checks when that is the claim this test already makes. Do not fill the table so that each value trips a different decorator.
3. **Intent is not clear enough.** You cannot tell which contract this test was protecting → do not edit it. Do not inline the current input. Do not replace it. Do not add cases. Report the conflicting signals. Leaving the violation is the signal; clearing it would pick a side.

A copied token is not the repaired case. Replace it only when this test already shows the input that belongs here, for example because the title quotes that input, or because another case for the same property shows the value that was duplicated. If the replacement would be coined from a neighboring field's pattern, that is result 3.

## Unresolved example

```ts
describe("when quantity is not an integer", () => {
	it.each(["nope"])("should be invalid when quantity is %o", async (quantity) => {
		await expect(validate({ quantity })).rejects.toBeInstanceOf(UnprocessableEntityException);
	});
});
```

The describe says "not an integer". The case is a non-numeric string. The table has one row. Inlining `"nope"` freezes the string as the contract and leaves the describe lying. Replacing `"nope"` with `1.5` because only the integer check rejects `1.5` freezes today's decorator, and today's transform pipeline, as the contract.

If siblings in this spec already separate "non-integer number" from "not a numeric representation", or already treat both as one "not a valid quantity" contract, follow that split. If they do not, leave the test and report that the describe, the input, and the one-case table disagree.

## Forbidden shortcuts

- Do not inline a conflicting case just to make the rule pass.
- Do not treat "keep the current input and drop `.each`" as a neutral default.
- Do not treat "fails exactly one decorator" as the quality bar for a case.
- Do not replace an input, or invent cases, so the test matches the current validator list.
- Do not coin a replacement for a copied token from a neighboring field's pattern.
- Do not collapse or complete a table in order to force one reading of an ambiguous contract.
- Do not add a case that repeats the same equivalence class, takes over a sibling test's contract, or exists only to keep `.each`.
- Do not add unrelated or speculative coverage.
- Do not reorganize unrelated test contexts.
- Do not rewrite assertions unless necessary to preserve the existing behavior.
- Do not modify production code.
- Do not disable or suppress `nestjs/no-single-case-each`.
- Do not fix unrelated lint violations encountered nearby.

If the chosen fix exposes another lint violation or test smell, leave it for the corresponding rule/skill. The remediation pipeline handles one structural property at a time.

## Verification

1. `npm run lint` on the touched specs. Every case you resolved has zero `nestjs/no-single-case-each`. Every case you left because its intent is not clear still reports the rule, and the diff does not touch it. Leave any other new or nearby violations for their own rule.
2. `npm test -- <affected.spec.ts>` — all tests in modified files pass. Skip this when you did not edit a spec.
3. Skim the diff against the stated reading: accidental inline, completed matrix, or left unresolved. An unresolved case was not rewritten. A resolved case was not turned into a single-decorator example. Production code was used to explain failures, not to define the contract.

## Reporting

For each violation, state which of the three results you reached and which signals in this test supported it (title, `describe`, siblings, the case itself).

When you leave a case, name the conflicting signals and say that you did not edit it. Do not propose a replacement value.
