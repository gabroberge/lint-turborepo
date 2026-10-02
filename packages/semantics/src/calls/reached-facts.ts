import { reachableFrom } from "../graph/reachable-from";
import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import type { CallEdge } from "./call-edge";
import { callEdgesFrom } from "./call-edges-from";
import type { ReachedFact } from "./reached-fact";

/**
 * Every fact of every unit whose code may run while `start` runs: its own
 * facts, then those of the units it calls, invokes or hands its functions
 * to, transitively (`defines` edges are not followed). This is a may-analysis
 * over the model: a fact being reached does not mean it happens, and code
 * outside the model is represented only by `unknown` facts.
 */
export function reachedFacts(model: ModuleModel, start: UnitId): ReachedFact[] {
	const running = (unit: UnitId): CallEdge[] => callEdgesFrom(model, unit).filter((edge) => edge.kind !== "defines");
	const reached: ReachedFact[] = [];
	for (const [unit, path] of reachableFrom(start, running, (edge) => edge.to)) {
		for (const fact of model.units.get(unit)?.facts ?? []) {
			reached.push({ fact, path, unit });
		}
	}

	return reached;
}
