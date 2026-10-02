import type { DeclarationId, UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import type { UnitKind } from "../model/unit";

/**
 * The units whose code runs when a declaration's value is called (or, for
 * accessors, read or written): a function's or method's body, an accessor's
 * bodies, or the function literals a field or variable was initialized with.
 */
export function callableUnits(
	model: ModuleModel,
	declarations: readonly DeclarationId[],
	kinds: readonly UnitKind[]
): UnitId[] {
	const units: UnitId[] = [];
	for (const unit of model.units.values()) {
		if (unit.declaration !== null && declarations.includes(unit.declaration) && kinds.includes(unit.kind)) {
			units.push(unit.id);
		}
	}

	return units;
}
