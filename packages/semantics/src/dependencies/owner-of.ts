import type { DeclarationId, UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";

/** The declaration owning a unit: its own, else its nearest enclosing unit's; `null` for module code. */
export function ownerOf(model: ModuleModel, unitId: UnitId): DeclarationId | null {
	let unit = model.units.get(unitId);
	while (unit !== undefined) {
		if (unit.declaration !== null) {
			return unit.declaration;
		}

		unit = unit.parent === null ? undefined : model.units.get(unit.parent);
	}

	return null;
}
