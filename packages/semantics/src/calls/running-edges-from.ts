import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import type { CallEdge } from "./call-edge";
import { cachedCallEdgesFrom } from "./call-edges-from";

const RUNNING = new WeakMap<ModuleModel, Map<UnitId, readonly CallEdge[]>>();

/**
 * The edges from a unit to code that may run while it runs: every edge but
 * `defines`. Computed once per model and unit; the result must not be changed.
 */
export function runningEdgesFrom(model: ModuleModel, from: UnitId): readonly CallEdge[] {
	let byUnit = RUNNING.get(model);
	if (byUnit === undefined) {
		byUnit = new Map();
		RUNNING.set(model, byUnit);
	}

	let edges = byUnit.get(from);
	if (edges === undefined) {
		edges = cachedCallEdgesFrom(model, from).filter((edge) => edge.kind !== "defines");
		byUnit.set(from, edges);
	}

	return edges;
}
