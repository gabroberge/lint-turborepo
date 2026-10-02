/**
 * Require Array subclasses to declare `Symbol.species`.
 *
 * Array subclasses inherit the default species constructor. Inherited Array
 * operations then construct new instances of the subclass, which can break
 * invariants when the result no longer looks like that subclass. This rule
 * asks for an explicit static `[Symbol.species]` member so that choice is
 * visible. Returning `Array` or `this` are both acceptable.
 *
 * No autofix. Which constructor to return is a semantic decision. Suppress
 * the warning with the standard lint disable comment when inherited species
 * behavior is intentional.
 *
 * Deliberate limitations:
 * - Only a direct `Array` identifier is recognized, including `Array<T>`.
 *   `globalThis.Array`, a renamed binding, and an intermediate base class
 *   are ignored.
 * - A local binding named `Array` is not distinguished from the built-in.
 * - The member's kind and return value are not inspected.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const requireArraySpeciesRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "warn",
	meta: {
		defaultOptions: [],
		docs: {
			description: "Require Array subclasses to declare Symbol.species.",
			recommended: true
		},
		messages: {
			missingSpecies:
				"Array subclasses should explicitly declare Symbol.species to acknowledge the constructor used by inherited Array operations."
		},
		schema: [],
		type: "suggestion"
	},
	name: "require-array-species"
};
