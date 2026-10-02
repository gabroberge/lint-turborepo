/**
 * Reject an `it` / `test` whose body repeats an earlier test.
 *
 * Different titles do not make two tests distinct when their bodies are the
 * same. Comparison is the written body, within one `describe`. Sibling
 * `describe` blocks stay separate even when their titles match. Tests with no
 * `describe` are compared within the file. Comments and formatting do not make
 * two bodies distinct. The first copy is kept; each later copy is reported.
 * Three copies in the same `describe` (or in the file, when there is no
 * `describe`) therefore produce two reports.
 *
 * `it.each` / `it.for` contribute the one written callback, not one entry per
 * row. A call without an inline callback, including `it.todo("…")`, is not
 * compared. A different literal, identifier, argument, or statement is a
 * different body. A helper call is compared as written and is not expanded.
 * Different bodies are not treated as the same just because they might behave
 * the same.
 *
 * Recognized callees match `test-call.ts`: `it` / `test` plus `only`, `skip`,
 * `todo`, `concurrent`, `sequential`, `fails`, `failing`, `skipIf`, `runIf`,
 * `each`, and `for`. The same body under different modifiers is still a
 * duplicate. `async` and the parameter list are not part of the body.
 *
 * Deliberate limitations:
 * - Renamed imports, `xit` / `fit` / `xtest`, and computed access (`it["skip"]`)
 *   are not recognized.
 * - A callback passed by identifier is not inspected.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noIdenticalTestBodyRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description:
				"Disallow an `it` / `test` body that repeats an earlier test in the same `describe`, or in the file when there is no `describe`.",
			recommended: true
		},
		messages: {
			identicalBody:
				"This test repeats an earlier test's body. Keep one test, parameterize the cases, or write a distinct body."
		},
		schema: [],
		type: "problem"
	},
	name: "no-identical-test-body"
};
