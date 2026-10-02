/**
 * Disallow equality assertions that compare a value with itself.
 *
 * An assertion must compare the actual value with an expected value written
 * separately. Comparing a value with itself, or with an object or array whose
 * only contents are a spread of that same value, does not check an observable
 * outcome. The assertion stays true even if the code under test changes.
 *
 * Flagged patterns:
 * - `expect(dto).toEqual(dto)` / `.toBe(dto)` / `.toStrictEqual(dto)`
 * - `expect(dto).toEqual({ ...dto })`, `expect(dto).toStrictEqual({ ...dto })`,
 *   and `expect(items).toEqual([...items])`
 * - The same shapes with transparent TypeScript wrappers on either side or on
 *   the spread argument (`as`, `satisfies`, non-null `!`, parentheses,
 *   type assertions)
 * - The same property path:
 *   `expect(result.data).toEqual(result.data)` and
 *   `expect(result.data).toEqual({ ...result.data })`
 * - `.not` between `expect(...)` and the matcher
 *   (`expect(dto).not.toEqual(dto)`). A positive matcher stays true; `.not`
 *   inverts that into a guaranteed failure. Either way the result does not
 *   check an observable outcome.
 *
 * Not flagged (intentionally):
 * - Different identifiers (`expect(actual).toEqual(expected)`), even when
 *   runtime values may coincide
 * - Spreads that add another property or element
 *   (`{ ...dto, status: "active" }`, `[...items, extra]`)
 * - `toBe` against a sole spread (`expect(dto).toBe({ ...dto })`). `toBe` is
 *   reference equality, and the spread is a new object, so the assertion is
 *   not trivially true.
 * - Spreading a literal (`expect(1).toEqual({ ...1 })`). A primitive spread
 *   does not reproduce the value.
 * - Calls and other side-effecting expressions
 *   (`expect(getValue()).toEqual(getValue())`)
 * - Non-equality matchers (`toBeInstanceOf`, `toThrow`, …)
 * - `.resolves` / `.rejects` — the `expect(...)` argument is not the value
 *   those matchers compare
 * - Custom `toEqualEntity`. It rewrites `Date` values on the expected side
 *   before comparing, so `expect(x).toEqualEntity(x)` is not always trivially
 *   true.
 *
 * Deliberate limitations:
 * - Only the identifier `expect` is recognized (same as `require-expect`).
 * - Expression identity is syntactic and side-effect-free only; no alias or
 *   symbolic analysis (`const expected = dto; expect(dto).toEqual(expected)`
 *   is allowed).
 * - Computed member keys must themselves be side-effect-free and match exactly
 *   (`result["data"]` does not match `result.data`).
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noTautologicalEqualityRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description:
				"Disallow equality assertions that compare a value with itself or with a sole spread of itself.",
			recommended: true
		},
		messages: {
			tautological:
				"This {{matcher}} compares a value with itself, so it does not check an observable outcome. Compare it with an expected value written separately."
		},
		schema: [],
		type: "problem"
	},
	name: "no-tautological-equality"
};
