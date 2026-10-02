/**
 * Disallow `it.each` / `test.each` / `describe.each` with exactly one static case.
 *
 * `.each` means there is more than one case. A table that is statically known
 * to contain one case should be a regular `it`, `test`, or `describe`, with
 * that value written directly. Do not keep a single-case `.each` for a
 * hypothetical later case.
 *
 * Only a static array table is counted. Each element is one case, including a
 * one-row array such as `[[42]]`. Zero-case and multi-case tables are ignored.
 * Variables, calls, spreads, and tagged templates are not evaluated, so their
 * case count is treated as unknown.
 *
 * Recognized callees match `test-call.ts`: `it` / `test` / `describe` plus
 * `only`, `skip`, `todo`, `concurrent`, `sequential`, `fails`, `failing`,
 * `skipIf`, and `runIf` before `.each`.
 *
 * No autofix. Substituting the case into the callback would have to rewrite
 * titles, parameters, and destructuring, which is easy to get wrong.
 *
 * Deliberate limitations:
 * - Renamed imports, `xit` / `fit` / `xtest`, and computed access (`it["each"]`)
 *   are not recognized.
 * - `it.for` / `test.for` / `describe.for` are a different API and are ignored.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noSingleCaseEachRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Disallow `.each` with exactly one case.",
			recommended: true
		},
		messages: {
			singleCase: "{{callee}}.each is for more than one case. Write this single case as {{callee}}."
		},
		schema: [],
		type: "problem"
	},
	name: "no-single-case-each"
};
