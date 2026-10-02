/**
 * Require each `it` / `test` to be nested inside a `describe` below the suite.
 *
 * Nesting is the only property this rule can see. The outermost `describe` is
 * the suite, whatever its title says. A test outside every `describe`, or
 * directly inside that suite, is reported. A further nested `describe`
 * satisfies the rule. There is no maximum depth, and two levels are enough.
 *
 * Titles are not read. A nested `describe` satisfies the rule whether or not
 * its title names a subject, a scenario, or a condition. That naming
 * convention is `docs/test-grammar.md`, not this rule.
 *
 * ```ts
 * describe("Accounts", () => {
 * 	describe("getAccount", () => {
 * 		it("returns the account", () => {});
 * 	});
 * });
 * ```
 *
 * A `describe` written around the test is what nests it, including
 * `describe(SomeClass, …)`. A helper that calls `describe` when it runs does
 * not. The call is judged where it is written.
 *
 * Recognized callees match `test-call.ts`: `it` / `test` / `describe` plus
 * `only`, `skip`, `todo`, `concurrent`, `sequential`, `fails`, `failing`,
 * `skipIf`, `runIf`, `each`, and `for` (including tagged-template `each` and
 * chains). `it.skipIf(condition)` and `it.each(table)` are not the test; the
 * call that receives the title is.
 *
 * No autofix. Choosing the nested `describe` is not determined by the source
 * position alone.
 *
 * Deliberate limitations:
 * - Renamed imports, `xit` / `fit` / `xtest`, and computed access (`it["skip"]`)
 *   are not recognized.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noTestOutsideDescribeRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Require each `it` / `test` to be nested inside a `describe` below the suite `describe`.",
			recommended: true
		},
		messages: {
			outsideDescribe:
				"Nest this {{callee}} under a `describe` inside the suite `describe`. The outermost `describe` is only the suite."
		},
		schema: [],
		type: "problem"
	},
	name: "no-test-outside-describe"
};
