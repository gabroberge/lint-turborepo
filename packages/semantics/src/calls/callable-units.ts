import type { DeclarationId, UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import type { UnitKind } from "../model/unit";
import { modelIndex } from "./model-index";

/**
 * The units whose code runs when a declaration's value is called (or, for
 * accessors, read or written): a function's or method's body, an accessor's
 * bodies, or the function literals a field or variable was initialized with
 * (stored in it, or handed to the assumed factory whose result it holds).
 * Units come in the model's order.
 */
export function callableUnits(
	model: ModuleModel,
	declarations: readonly DeclarationId[],
	kinds: readonly UnitKind[]
): UnitId[] {
	const { ordinals, unitsByDeclaration } = modelIndex(model);
	const units = declarations.flatMap((declaration) =>
		(unitsByDeclaration.get(declaration) ?? []).filter((unit) => kinds.includes(unit.kind)).map((unit) => unit.id)
	);
	return declarations.length > 1
		? units.toSorted((left, right) => order(ordinals, left) - order(ordinals, right))
		: units;
}

function order(ordinals: ReadonlyMap<UnitId, number>, unit: UnitId): number {
	return ordinals.get(unit) ?? 0;
}
