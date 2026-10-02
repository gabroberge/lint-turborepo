import type { ModuleModel } from "../model/module-model";
import type { CallEdge } from "./call-edge";
import { callEdgesFrom } from "./call-edges-from";

/** Every call relation between the module's units, unit by unit. */
export function callGraph(model: ModuleModel): CallEdge[] {
	return [...model.units.keys()].flatMap((unit) => callEdgesFrom(model, unit));
}
