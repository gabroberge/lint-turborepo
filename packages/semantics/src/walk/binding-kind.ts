import type { IdentifierNode } from "@gabroberge/oxlint-estree";
import { resolveVariable } from "@gabroberge/oxlint-estree";

import type { AnalysisScope } from "./analysis-scope";

/** Bindings that can never be reassigned. */
const CONSTANT_DEFINITIONS = new Set(["ImportBinding", "TSEnumName"]);
const IMMUTABLE_GLOBALS = new Set(["Infinity", "NaN", "undefined"]);

/**
 * How reading an identifier relates to initialization order. A `local`
 * binding is declared inside the analyzed member. A `stable` one cannot
 * change while the class is set up: an enum, a `const`, or a class,
 * function, `let` or `var` that is never assigned after its declaration.
 * Imports also count as stable, which assumes the exporting module does not
 * reassign a live binding during class setup (a documented limitation).
 * Anything else, including globals, is `mutable`.
 */
export function bindingKind(scope: AnalysisScope, identifier: IdentifierNode): "local" | "mutable" | "stable" {
	const variable = resolveVariable(scope.sourceCode, identifier);
	const definition = variable?.defs[0];
	if (variable === null || definition === undefined) {
		return IMMUTABLE_GLOBALS.has(identifier.name) ? "stable" : "mutable";
	}

	const [ownerStart, ownerEnd] = scope.owner.range;
	const [start, end] = definition.name.range;
	if (start >= ownerStart && end <= ownerEnd) {
		return "local";
	}

	const declaration = definition.parent;
	const constant =
		CONSTANT_DEFINITIONS.has(definition.type) ||
		(declaration?.type === "VariableDeclaration" && declaration.kind === "const");
	if (constant) {
		return "stable";
	}

	const reassigned = variable.references.some((reference) => reference.isWrite() && !reference.init);
	return reassigned || definition.type === "Parameter" ? "mutable" : "stable";
}
