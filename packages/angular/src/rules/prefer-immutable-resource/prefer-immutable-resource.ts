/**
 * Prefer `readonly` on Angular `resource` / `rxResource` fields and
 * `ResourceRef` annotations.
 *
 * A resource is a handle, not a value to reassign. Replacing the field drops
 * the existing request state. The rule asks for `readonly` so that
 * reassignment is a type error.
 *
 * Autofix inserts `readonly` before the property name.
 *
 * Deliberate limitations:
 * - Only a direct `resource` / `rxResource` identifier is recognized.
 *   `core.resource` and a renamed import are ignored.
 * - Only a direct `ResourceRef` type identifier is recognized.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const preferImmutableResourceRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Prefer readonly on Angular resource fields.",
			recommended: true
		},
		fixable: "code",
		messages: {
			preferImmutableResource: "Prefer to declare `{{type}}` as `readonly` since they should not be mutated."
		},
		schema: [],
		type: "suggestion"
	},
	name: "prefer-immutable-resource"
};
