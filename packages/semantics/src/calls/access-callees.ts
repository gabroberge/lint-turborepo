import type { AccessFact } from "../model/fact";
import type { DeclarationId, UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import type { AccessTarget, UnitTarget } from "../model/target";
import { callableUnits } from "./callable-units";
import type { ModelIndex } from "./model-index";
import { memberIndexKey, modelIndex } from "./model-index";

/** A unit an access may run, and whether it runs it now (`calls`) or may run it (`may-run`). */
export interface AccessCallee {
	kind: "calls" | "may-run";
	unit: UnitId;
}

/** An access target that may name declarations: anything but a function literal's unit. */
type DeclaredTarget = Exclude<AccessTarget, UnitTarget>;

const CALLED_KINDS = ["function", "method"] as const;

/**
 * The units an access may run, with whether it calls them or only hands
 * them on:
 * - reading a getter or writing a setter runs it;
 * - calling a member or binding runs its body or the functions it was
 *   initialized with; a function handed to an assumed factory (`total =
 *   computed(() => …)`) is only `may-run`: the factory's value may run it
 *   on demand, or return a cached result;
 * - constructing a module class (`new A()`) runs its `instance-construction`
 *   units: instance field initializers and the constructor (which also
 *   assigns parameter properties); a superclass's construction is not followed;
 * - calling a function literal's unit directly runs it;
 * - reading a method, a function or a function-holding field hands its code on.
 *
 * Accesses to imports, globals, properties of other objects and undeclared
 * members resolve to nothing: their code is outside the model.
 */
export function accessCallees(model: ModuleModel, fact: AccessFact): AccessCallee[] {
	const { mode, target } = fact;
	if (target.kind === "unit") {
		return mode === "call"
			? [{ kind: "calls", unit: target.unit }]
			: mode === "read"
				? [{ kind: "may-run", unit: target.unit }]
				: [];
	}

	const index = modelIndex(model);
	const declarations = targetDeclarations(index, target);
	if (declarations.length === 0) {
		return [];
	}

	if (mode === "write") {
		return callableUnits(model, declarations, ["setter"]).map((unit) => ({ kind: "calls", unit }));
	}

	const [only] = declarations;
	if (mode === "construct" && only !== undefined && model.declarations.get(only)?.kind === "class") {
		return (index.instanceConstruction.get(only) ?? []).map((unit) => ({ kind: "calls", unit }));
	}

	const getters = callableUnits(model, declarations, ["getter"]).map((unit) => ({ kind: "calls" as const, unit }));
	const bodies = callableUnits(model, declarations, CALLED_KINDS);
	const runs: AccessCallee["kind"] = mode === "read" ? "may-run" : "calls";
	return [
		...getters,
		...bodies.map((unit): AccessCallee => ({
			kind: index.dispositions.get(unit) === "passed-to-assumed" ? "may-run" : runs,
			unit
		}))
	];
}

/**
 * The declarations an access target may denote. A member target names one
 * declaration, but every member of its class with the same key on the same
 * side shares the runtime key: a getter and its setter are two declarations,
 * and a field shadows a method of the same name.
 */
function targetDeclarations(index: ModelIndex, target: DeclaredTarget): readonly DeclarationId[] {
	if (target.kind === "binding") {
		return target.declaration === null ? [] : [target.declaration];
	}

	if (target.kind === "property" || target.member === null) {
		return [];
	}

	return index.members.get(memberIndexKey(target.class, target.static, target.key)) ?? [];
}
