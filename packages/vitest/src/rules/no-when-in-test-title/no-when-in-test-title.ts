/**
 * A condition belongs in a `describe` title, not in an `it` / `test` title.
 *
 * A scenario `describe` states the condition (`when …`). Its `beforeEach`
 * arranges that scenario. The `it` / `test` title states only the behavioral
 * outcome.
 *
 * Preferred shape:
 *
 * ```ts
 * describe("when the account does not exist", () => {
 * 	beforeEach(() => {
 * 		// scenario setup
 * 	});
 *
 * 	it("returns null", () => {
 * 		// act and assert
 * 	});
 * });
 * ```
 *
 * Invalid: `it("returns null when the account does not exist")` and
 * `it("when the account does not exist, returns null")`.
 *
 * Flags the whole word `when` at any capitalization. `whenever`, `whence`, and
 * other words that merely contain those letters are ignored. `describe` titles
 * are ignored. A nested `describe` is where a `when` condition belongs. An
 * outermost suite title that starts with `when` is `no-when-in-suite-title`,
 * not this rule. This fixer does not invent a suite name.
 *
 * Recognized callees match `test-call.ts`: `it` / `test` plus `only`, `skip`,
 * `todo`, `concurrent`, `sequential`, `fails`, `failing`, `skipIf`, `runIf`,
 * `each`, and `for` (including tagged-template `each` and chains).
 * `it.skipIf(condition)` / `it.each(table)` / `it.for(cases)` do not treat that
 * condition or table as a title. `it.todo("… when …")` is flagged because the
 * title still encodes the condition.
 *
 * Autofix performs only the title split. A static title with exactly one
 * `when` word and non-empty text on both sides becomes
 * `describe("<when> <condition>", () => { <same call>("<behavioral outcome>", …) })`.
 * The `when` word keeps the capitalization it had in the title. The nearest
 * `describe` is reused only when its static title is exactly that string and
 * the condition has no parameter placeholders; the fixer then changes the test
 * title and does not wrap again. Sibling tests are fixed independently and are
 * not grouped.
 *
 * Parameter placeholders (`%s`, `%i`, `$name`, `$#`, `$0`, …) are classified by
 * which side of `when` contains them. Placeholders only in the behavioral outcome stay on
 * the test, inside a static `describe`. Placeholders only in the condition are
 * promoted with the dataset: `it.each(table)(…)` / `it.for(cases)(…)` becomes
 * `describe.each` / `describe.for`, the original callback parameters move to
 * that suite callback, and the new `it` / `test` closes over them. For `.for`,
 * only the first parameter is the row; later parameters stay on the test
 * because Vitest passes `TestContext` there. `only`, `skip`, `concurrent`,
 * `sequential`, `skipIf`, and `runIf` move with the dataset. `fails` /
 * `failing` stay on the test. Placeholders on both sides, `%%` left on a
 * non-parameterized title, `todo`, and modifiers chained after `.each` / `.for`
 * are reported without a fix.
 *
 * The fixer does not move setup into `beforeEach`, edit the callback body, or
 * merge describes. A reported title stays reported when it cannot be split
 * safely: dynamic text, interpolation, more than one `when`, an empty side,
 * a call that is part of a larger expression, or a callback whose multiline
 * template or JSX text would change if the wrapper were indented with the new
 * `describe`.
 *
 * Deliberate limitations:
 * - Only string literals and template literals are checked. Identifier or class
 *   titles (`it(SomeClass)`) are ignored.
 * - Template titles are checked only on static cooked segments. Interpolated
 *   expressions are not evaluated (`it(\`accepts ${name}\`)` is allowed even
 *   when `name` would contain "when" at runtime).
 * - Renamed imports, `xit` / `fit` / `xtest`, and computed access (`it["skip"]`)
 *   are not recognized.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noWhenInTestTitleRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Require a `when` condition to be a `describe` title, not an `it` / `test` title.",
			recommended: true
		},
		fixable: "code",
		messages: {
			whenInTitle:
				"Move this `when` condition into a nested `describe` title. Keep the {{callee}} title as the behavioral outcome."
		},
		schema: [],
		type: "problem"
	},
	name: "no-when-in-test-title"
};
