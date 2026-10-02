/**
 * Order the direct children of a DTO suite `describe`.
 *
 * Applies to `*.dto.spec.ts` only. The suite is the outermost `describe`.
 * Its direct children stay in three groups:
 *
 * 1. Setup stays first, in source order. A direct child that is not a
 *    `describe`, `it`, or `test` is setup (`beforeEach`, declarations, helpers).
 * 2. `describe` blocks whose static title starts with the word `when` come
 *    next, in their existing relative order.
 * 3. Property `describe` blocks come last, sorted alphabetically by that
 *    static title. A property title is one identifier: a letter, then letters
 *    or digits. The identifier `when` is a property title, not a `when` group.
 *
 * The rule does not rename titles, decide which class declares a property,
 * regroup tests, or edit what a block contains. Nested `describe` blocks are
 * not reordered.
 *
 * Autofix reorders those direct children when every one of them falls into a
 * group. Each moved piece is the complete statement plus the comments on the
 * lines directly above it. Blank lines between children stay in place.
 * Relative order inside a group is unchanged. When a child cannot be
 * classified, or two children share a line, the violation is reported and
 * nothing is moved.
 *
 * Deliberate limitations:
 * - Renamed `describe` / `it` / `test`, `xit`, and computed access
 *   (`describe["skip"]`) are not recognized. An unrecognized call is setup.
 * - A title that is not a static string is not classified. Templates with
 *   interpolations, identifiers, and other expressions are in that group.
 * - A `describe` written inside a helper is judged where the call is written.
 *   A helper invoked from inside the suite does not make that call nested.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";

export const orderedDtoTestGroupsRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description:
				"Require a DTO spec suite to list setup, then `when` describes, then property describes in alphabetical order."
		},
		fixable: "code",
		messages: {
			unclassified:
				"This suite child is not setup, a `when` describe, or a property describe, so the suite order cannot be fixed.",
			unordered:
				"Order this suite as setup, then `when` describes, then property describes in alphabetical order."
		},
		schema: [],
		type: "problem"
	},
	name: "ordered-dto-test-groups"
};
