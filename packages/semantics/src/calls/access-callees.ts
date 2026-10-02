import { sameKey } from "../member/same-key";
import type { AccessFact } from "../model/fact";
import type { DeclarationId, UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import type { AccessTarget } from "../model/target";
import { callableUnits } from "./callable-units";

const CALLED_KINDS = ["function", "method"] as const;

/**
 * The units an access may run, with whether it calls them or only hands
 * them on. Reading a getter or writing a setter runs it; calling a member or
 * binding runs its body or the functions it was initialized with; reading a
 * method, a function or a function-holding field hands its code on.
 * Accesses to imports, globals, properties of other objects and undeclared
 * members resolve to nothing: their code is outside the model.
 */
export function accessCallees(model: ModuleModel, fact: AccessFact): { kind: "calls" | "may-run"; unit: UnitId }[] {
	const declarations = targetDeclarations(model, fact.target);
	if (declarations.length === 0) {
		return [];
	}

	const getters = callableUnits(model, declarations, ["getter"]).map((unit) => ({ kind: "calls" as const, unit }));
	if (fact.mode === "write") {
		return callableUnits(model, declarations, ["setter"]).map((unit) => ({ kind: "calls" as const, unit }));
	}

	const bodies = callableUnits(model, declarations, CALLED_KINDS);
	if (fact.mode === "call") {
		return [...getters, ...bodies.map((unit) => ({ kind: "calls" as const, unit }))];
	}

	return [...getters, ...bodies.map((unit) => ({ kind: "may-run" as const, unit }))];
}

/**
 * The declarations an access target may denote. A member target names one
 * declaration, but every member of its class with the same key on the same
 * side shares the runtime key: a getter and its setter are two declarations,
 * and a field shadows a method of the same name.
 */
function targetDeclarations(model: ModuleModel, target: AccessTarget): DeclarationId[] {
	if (target.kind === "binding") {
		return target.declaration === null ? [] : [target.declaration];
	}

	if (target.kind === "property" || target.member === null) {
		return [];
	}

	const declarations: DeclarationId[] = [];
	for (const declaration of model.declarations.values()) {
		if (
			declaration.kind !== "class" &&
			declaration.kind !== "function" &&
			declaration.kind !== "import" &&
			declaration.kind !== "variable" &&
			declaration.class === target.class &&
			declaration.static === target.static &&
			declaration.key !== null &&
			sameKey(declaration.key, target.key)
		) {
			declarations.push(declaration.id);
		}
	}

	return declarations;
}
