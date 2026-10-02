import { cyclicComponents } from "../graph/cyclic-components";
import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import { callEdgesFrom } from "./call-edges-from";

/**
 * Groups of units that may run each other in a cycle, through `calls`,
 * `invokes` and `may-run` relations (recursion, mutual recursion, a callback
 * that calls back into its caller). A group is a structural fact about the
 * call relations, not evidence that the cycle runs, or that it is a defect.
 */
export function recursiveUnitGroups(model: ModuleModel): UnitId[][] {
	return cyclicComponents([...model.units.keys()], (unit) =>
		callEdgesFrom(model, unit)
			.filter((edge) => edge.kind !== "defines")
			.map((edge) => edge.to)
	);
}
