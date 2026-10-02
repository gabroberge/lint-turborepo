/**
 * A suite `describe` names the file or the unit under test. A title that
 * starts with `when` is a scenario condition, not a suite name.
 *
 * The outermost `describe` is the suite: a `describe` that is not written
 * inside another `describe` callback. Nested `describe` titles may start with
 * `when`. That is the scenario form.
 *
 * ```ts
 * describe("Accounts", () => {
 * 	describe("when the account is missing", () => {
 * 		it("returns null", () => {});
 * 	});
 * });
 * ```
 *
 * Invalid: `describe("when the account is missing", () => { … })` at suite
 * level, including when a subject `describe` is nested inside that condition.
 *
 * Flags a static title whose first word is `when`, at any capitalization.
 * Leading whitespace is ignored. `whenever`, `whence`, and other words that
 * merely contain those letters are ignored. A `when` that is not the first
 * word is ignored (`describe("Accounts when empty")`), because that title is
 * not the scenario form.
 *
 * Recognized callees match `test-call.ts`: `describe` plus `only`, `skip`,
 * `todo`, `concurrent`, `sequential`, `fails`, `failing`, `skipIf`, `runIf`,
 * `each`, and `for` (including tagged-template `each` and chains).
 * `describe.skipIf(condition)` / `describe.each(table)` / `describe.for(cases)`
 * do not treat that condition or table as a title.
 *
 * No autofix. The suite name is the file or the unit under test, which this
 * rule cannot invent. Moving the condition under a new suite is a semantic edit.
 *
 * This rule does not look at `it` / `test` titles. The word `when` there is
 * `no-when-in-test-title`. It does not require a nested `describe` to start
 * with `when`: a subject `describe` is also a nested `describe`.
 *
 * Deliberate limitations:
 * - Only string literals and template literals are checked. Identifier or class
 *   titles (`describe(SomeClass)`) are ignored.
 * - A template is judged by its leading static text. Later interpolations are
 *   not evaluated. `describe(\`when ${reason}\`)` is flagged because it starts
 *   with `when`. A title that only contains `when` after an interpolation is not.
 * - A `describe` written inside a helper is judged where the call is written.
 *   A helper that is invoked from inside another `describe` does not make the
 *   call nested.
 * - Renamed imports and computed access (`describe["skip"]`) are not recognized.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noWhenInSuiteTitleRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Disallow a suite `describe` title that starts with `when`."
		},
		messages: {
			whenInSuiteTitle:
				"This suite `describe` starts with `when`, which names a scenario condition. Name the suite for the file or the unit under test, and nest the condition in a scenario `describe`."
		},
		schema: [],
		type: "problem"
	},
	name: "no-when-in-suite-title"
};
