/**
 * Conditional wording in an `it` / `test` title needs inspection.
 *
 * A `describe` states the subject, scenario, or condition. The `it` / `test`
 * title states the behavioral outcome. A title such as
 * `it("returns false if the value is invalid")` mixes those roles.
 *
 * Unlike `when`, `if` is not safe to split mechanically. The word may be a
 * condition that belongs in a `describe`, or it may be part of the behavioral
 * outcome. This rule only asks for inspection. Move the condition into a
 * `describe`, restructure the scenario, rewrite the title, or suppress the
 * rule locally and explain why.
 *
 * Flags the whole word `if` at any capitalization. `diff`, `verify`, `iff`,
 * and other words that merely contain those letters are ignored. `describe`
 * titles are ignored.
 *
 * Recognized callees match `test-call.ts`: `it` / `test` plus `only`, `skip`,
 * `todo`, `concurrent`, `sequential`, `fails`, `failing`, `skipIf`, `runIf`,
 * `each`, and `for` (including tagged-template `each` and chains).
 * `it.skipIf(condition)` / `it.each(table)` / `it.for(cases)` do not treat that
 * condition or table as a title. `it.todo("… if …")` is flagged because the
 * title still encodes the condition.
 *
 * No autofix. Presence of `if` is enough to require inspection and not enough
 * to choose a restructuring.
 *
 * Deliberate limitations:
 * - Only string literals and template literals are checked. Identifier or class
 *   titles (`it(SomeClass)`) are ignored.
 * - Template titles are checked only on static cooked segments. Interpolated
 *   expressions are not evaluated (`it(\`accepts ${name}\`)` is allowed even
 *   when `name` would contain "if" at runtime).
 * - Renamed imports, `xit` / `fit` / `xtest`, and computed access (`it["skip"]`)
 *   are not recognized.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noIfInTestTitleRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Require inspection when an `it` / `test` title contains `if`.",
			recommended: true
		},
		messages: {
			ifInTitle:
				"Inspect `if` in this {{callee}} title. Move a condition into a `describe`. If the word is part of the behavioral outcome, suppress this rule locally and explain why."
		},
		schema: [],
		type: "problem"
	},
	name: "no-if-in-test-title"
};
