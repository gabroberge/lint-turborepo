/**
 * Prefer `protected` on Angular `output()` fields and `OutputEmitterRef`
 * annotations.
 *
 * An output is for the template and subclasses, not for arbitrary callers on
 * the class instance. Public or implicit-public exposure lets consumers emit
 * from outside the component. Private hides the output from subclasses. The
 * rule asks for `protected`.
 *
 * Autofix rewrites `public` / `private` to `protected`, or inserts
 * `protected` when no accessibility keyword is present.
 *
 * Deliberate limitations:
 * - Only a direct `output` identifier is recognized.
 * - Only a direct `OutputEmitterRef` type identifier is recognized.
 * - The `@Output()` decorator is not inspected.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const preferProtectedOutputsRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Prefer protected on Angular output fields.",
			recommended: true
		},
		fixable: "code",
		messages: {
			preferProtectedOutput:
				"Prefer to declare `{{type}}` as `protected` since it should not be exposed directly."
		},
		schema: [],
		type: "suggestion"
	},
	name: "prefer-protected-outputs"
};
