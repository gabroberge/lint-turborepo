import type { AccessFact } from "../model/fact";
import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
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
	const { target } = fact;
	const declaration =
		target.kind === "member" ? target.member : target.kind === "binding" ? target.declaration : null;
	if (declaration === null) {
		return [];
	}

	const getters = callableUnits(model, declaration, ["getter"]).map((unit) => ({ kind: "calls" as const, unit }));
	if (fact.mode === "write") {
		return callableUnits(model, declaration, ["setter"]).map((unit) => ({ kind: "calls" as const, unit }));
	}

	const bodies = callableUnits(model, declaration, CALLED_KINDS);
	if (fact.mode === "call") {
		return [...getters, ...bodies.map((unit) => ({ kind: "calls" as const, unit }))];
	}

	return [...getters, ...bodies.map((unit) => ({ kind: "may-run" as const, unit }))];
}
