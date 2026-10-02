import type { IdentifierNode } from "@gabroberge/oxlint-estree";
import { resolveVariable } from "@gabroberge/oxlint-estree";

import type { Walker } from "../walk/walker";
import { isInside } from "./is-inside";
import { isReassigned } from "./is-reassigned";
import type { Resolution } from "./resolution";

/** Globals that can never change. */
const IMMUTABLE_GLOBALS = new Set(["Infinity", "NaN", "undefined"]);

/**
 * Resolve an identifier from the walked unit through the scope manager.
 * Module-level and imported bindings resolve to their declaration; a binding
 * declared inside the unit's own code is local; one declared in an
 * enclosing function is a closure binding; anything unresolved is global.
 */
export function resolveIdentifier(walker: Walker, identifier: IdentifierNode): Resolution {
	const { draft, unit } = walker;
	const variable = resolveVariable(draft.sourceCode, identifier);
	const definition = variable?.defs[0];
	if (variable === null || definition === undefined) {
		const mutable = !IMMUTABLE_GLOBALS.has(identifier.name);
		return {
			kind: "binding",
			target: { declaration: null, kind: "binding", mutable, name: identifier.name, scope: "global" }
		};
	}

	const classId =
		draft.classByVariable.get(variable) ??
		(definition.type === "ClassName" ? draft.classByNode.get(definition.node) : undefined);
	const declaration = draft.declarationByVariable.get(variable) ?? classId ?? null;
	const name = identifier.name;
	if (variable.scope.type === "module" || variable.scope.type === "global") {
		const imported = definition.type === "ImportBinding";
		const constant = definition.parent?.type === "VariableDeclaration" && definition.parent.kind === "const";
		const mutable = !imported && !constant && isReassigned(variable);
		const target = { declaration, kind: "binding", mutable, name, scope: imported ? "import" : "module" } as const;
		return classId === undefined ? { kind: "binding", target } : { class: classId, kind: "class", target };
	}

	if (classId !== undefined) {
		// The class's inner name binding, visible inside its own body.
		const target = { declaration: classId, kind: "binding", mutable: false, name, scope: "module" } as const;
		return { class: classId, kind: "class", target };
	}

	if (isInside(definition.name, unit.code)) {
		const declarator = definition.node;
		return { initializer: declarator.type === "VariableDeclarator" ? declarator.init : null, kind: "local" };
	}

	const mutable = definition.type === "Parameter" || isReassigned(variable);
	return { kind: "binding", target: { declaration: null, kind: "binding", mutable, name, scope: "closure" } };
}
