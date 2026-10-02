/**
 * Require every executable `it` / `test` callback to contain an `expect` call.
 *
 * A test only protects an observable outcome it checks. Running production code
 * without `expect` is not evidence the behavioral outcome happened. This rule
 * does not judge whether the assertion matches the title, require a specific
 * number of assertions, or require `toHaveBeenCalled`.
 *
 * What counts as an assertion:
 * - A call named `expect` (`expect(x)`, `expect(x).toBe(...)`,
 *   `await expect(...).rejects.toThrow(...)`, `expect.assertions(1)`,
 *   `expect.hasAssertions()`)
 * - That call must be in the test's own body. Ordinary control flow (`if`,
 *   loops, `try`, blocks) still counts. An `expect` inside a nested function
 *   does not, whether or not that function is called.
 *
 * Exemptions:
 * - `it.todo` / `test.todo` (with or without a callback) — declarations of
 *   missing tests, not executable bodies
 * - `it` / `test` (and modifiers) with no callback — e.g. `it.skip("title")`
 *
 * Still required:
 * - `it.skip` / `test.skip` / `.only` / `.concurrent` / `.each` / `.for` /
 *   `.fails` (and similar) **when they have a callback** — the body is a real
 *   test even if currently disabled or focused
 *
 * `it.each(table)` and `it.skipIf(condition)` are not the test. The call that
 * receives the test body is.
 *
 * Deliberate limitations:
 * - Only the identifier `expect` is recognized. Renamed bindings
 *   (`import { expect as e }`) are not detected.
 * - `xit` / `fit` / `xtest` and computed access (`it["skip"]`) are not
 *   recognized (same as `test-call.ts`).
 * - A helper that is not named `expect` (`assert`, or a custom helper) is not
 *   an assertion here, and this rule does not look inside it. A custom matcher
 *   on an `expect` chain, such as `toEqualEntity`, does count.
 * - Callbacks passed by identifier (`it("title", myTest)`) are not inspected;
 *   only inline function / arrow callbacks are checked.
 * - An `expect` in a surrounding `beforeEach` / `beforeAll` / outer helper does
 *   not satisfy the test.
 * - An `expect` inside a nested `it` / `test` satisfies that nested test only.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const requireExpectRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Require each `it` / `test` to call `expect` in its own body.",
			recommended: true
		},
		messages: {
			missingExpect: "Call `expect` in this {{callee}} so it directly asserts an observable outcome."
		},
		schema: [],
		type: "problem"
	},
	name: "require-expect"
};
