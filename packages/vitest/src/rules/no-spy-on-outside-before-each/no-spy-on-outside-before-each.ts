/**
 * Require every `vi.spyOn` to be created inside `beforeEach`.
 *
 * `vi.spyOn` arranges the scenario. The only place that counts is the
 * callback written on `beforeEach(...)`. A spy in `it` / `test`, directly in
 * `describe`, or at module scope is reported.
 *
 * A callback nested inside that `beforeEach` does not count. The call has to
 * sit in the `beforeEach` callback itself. The rule does not decide whether
 * a later test needs the spy. Assigning the spy to an outer variable is fine
 * when the call stays in `beforeEach`.
 *
 * No autofix. Moving the call usually needs a new variable and changes when
 * the spy is created.
 *
 * Deliberate limitations:
 * - Only `vi.spyOn`. `jest.spyOn`, a renamed `vi`, `vi["spyOn"]`, and
 *   `vi?.spyOn` are not recognized.
 * - `beforeEach(setup)` does not cover spies written in `setup`. The callback
 *   has to be the function on the `beforeEach` call.
 * - `beforeAll` and `afterEach` are not `beforeEach`.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const noSpyOnOutsideBeforeEachRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Require `vi.spyOn` to be created inside `beforeEach`.",
			recommended: true
		},
		messages: {
			spyOnOutsideBeforeEach: "Create this `vi.spyOn` inside `beforeEach`."
		},
		schema: [],
		type: "problem"
	},
	name: "no-spy-on-outside-before-each"
};
