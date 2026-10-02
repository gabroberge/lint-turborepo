/**
 * Order class members by a configurable list of groups, with Angular
 * signal-API categories, without breaking field initialization.
 *
 * Preferred order: group, then visibility, then name (or source order for a
 * group configured that way). Field initializers run in source order, so the
 * rule only moves one past another when it can show that the swap is
 * unobservable. An initializer that eagerly reads or writes another member
 * keeps its source position relative to it. A function stored for later (the
 * body of `computed()`, an arrow-function field) does not count, unless an
 * initializer calls it right away. Initializers whose side effects might
 * interact also keep their order; when the preferred order disagrees, that
 * is reported without an autofix.
 *
 * The initialization analysis is `@gabroberge/typescript-class-analyzer`.
 * This rule tells it what to assume about `@angular/core` calls
 * (`angular/angular-assumptions.ts`) and owns everything Angular-specific:
 * categories, groups, the default preset, spacing and diagnostics.
 *
 * Angular categories come from imports of `@angular/core`: named, aliased or
 * namespace. A local function called `signal` is an ordinary property.
 *
 * Defaults are applied by `resolveOptions` rather than `meta.defaultOptions`,
 * so the rule can tell a top-level setting the user chose from a default.
 *
 * Deliberate limitations:
 * - Decorators such as `@Input()` are not inspected; decorated fields are categorized by their initializer.
 * - Decorators move with their member. Their evaluation order is assumed unobservable.
 * - `inject()`, `input()`, `output()`, `model()`, signal and query factories are assumed not to observe initialization order. Their arguments are still analyzed.
 * - Methods are analyzed as declared in this class; overrides in a subclass are not considered.
 * - Getters and implicit conversions on other objects are assumed side-effect free.
 */

import type { PluginRule } from "@gabroberge/oxlint-plugin";

import { lint } from "./lint";
import { OPTIONS_SCHEMA } from "./options/options-schema";
import { MESSAGES } from "./report/messages";

export const orderedClassMembersRule: PluginRule = {
	create(context) {
		return lint(context);
	},
	defaultSeverity: "error",
	meta: {
		defaultOptions: [],
		docs: {
			description:
				"Require class members in a configurable group order, keeping field initializers that depend on each other in source order.",
			recommended: false
		},
		fixable: "code",
		messages: MESSAGES,
		schema: OPTIONS_SCHEMA,
		type: "suggestion"
	},
	name: "ordered-class-members"
};
