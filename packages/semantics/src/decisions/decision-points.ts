import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import type { DecisionPoint } from "./decision-point";
import { decisionPointsIn } from "./decision-points-in";

/**
 * The decision points written in one unit's own code, excluding those of
 * nested units (function literals, member bodies). Code of a nested class,
 * enum or namespace that the model does not analyze stays with the
 * enclosing unit. Unknown unit ids have none.
 */
export function decisionPoints(model: ModuleModel, unit: UnitId): DecisionPoint[] {
	const code = model.units.get(unit)?.code ?? [];
	return decisionPointsIn(code, model.boundaries);
}
