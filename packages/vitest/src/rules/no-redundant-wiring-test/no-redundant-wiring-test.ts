/**
 * Disallow a minimal wiring test once its suite has another executable test.
 *
 * A minimal wiring test only checks that a value is defined:
 * `expect(value).toBeDefined()`. It may repeat that assertion. It is allowed
 * only when it is the only executable `it` / `test` in its suite.
 *
 * The suite is the outermost `describe`. Another executable test anywhere in
 * that describe, including inside a descendant `describe`, makes the wiring
 * test redundant. A separate top-level `describe` is a different suite.
 *
 * The title is ignored. A test is not a wiring test when its body does
 * anything else: another matcher, a call, mock setup, an assignment, or any
 * other statement. Helpers are not inspected.
 *
 * `it.todo` / `test.todo` are declarations, with or without a callback, and do
 * not make a wiring test redundant. `skip`, `only`, and the other modifiers
 * count when they have an executable callback. A test with no callback does
 * not.
 *
 * Autofix removes that test statement and nothing else. It does not move the
 * assertions, edit setup, edit neighboring tests, drop unused variables, or
 * reorganize `describe` blocks. A comment that syntactically belongs to the
 * removed test is removed with it. Other comments stay. When the statement
 * cannot be removed without changing surrounding syntax, or a comment on its
 * line could belong to something else, the violation is reported without a fix.
 *
 * Deliberate limitations:
 * - Renamed imports, `xit` / `fit` / `xtest`, and computed access (`it["skip"]`)
 *   are not recognized.
 * - A callback passed by identifier is an executable test, but its body is not
 *   inspected, so it is not classified as a wiring test.
 * - A wiring test with no `describe` has no suite and is not reported.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noRedundantWiringTestRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Disallow a minimal wiring test when its suite contains another executable test."
		},
		fixable: "code",
		messages: {
			redundantWiringTest: "This wiring test is redundant because the suite contains another executable test."
		},
		schema: [],
		type: "problem"
	},
	name: "no-redundant-wiring-test"
};
