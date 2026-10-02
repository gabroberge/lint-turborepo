import { reachableFrom } from "../graph/reachable-from";
import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import type { ReachedFact } from "./reached-fact";
import { runningEdgesFrom } from "./running-edges-from";

const REACHED = new WeakMap<ModuleModel, Map<UnitId, readonly ReachedFact[]>>();

/** `reachedFacts`, computed once per model and unit; the result must not be changed. */
export function cachedReachedFacts(model: ModuleModel, start: UnitId): readonly ReachedFact[] {
	let byUnit = REACHED.get(model);
	if (byUnit === undefined) {
		byUnit = new Map();
		REACHED.set(model, byUnit);
	}

	let reached = byUnit.get(start);
	if (reached === undefined) {
		reached = collect(model, start);
		byUnit.set(start, reached);
	}

	return reached;
}

/**
 * Every fact of every unit whose code may run while `start` runs: its own
 * facts, then those of the units it calls, invokes, evaluates or hands its
 * functions to, transitively (`defines` edges are not followed). This is a
 * may-analysis over the model: a fact being reached does not mean it
 * happens, and code outside the model is represented only by `unknown` facts.
 *
 * Results are computed once per model and unit: a model must not be changed
 * after it has been queried.
 */
export function reachedFacts(model: ModuleModel, start: UnitId): ReachedFact[] {
	return [...cachedReachedFacts(model, start)];
}

function collect(model: ModuleModel, start: UnitId): ReachedFact[] {
	const reached: ReachedFact[] = [];
	const paths = reachableFrom(
		start,
		(from: UnitId) => runningEdgesFrom(model, from),
		(edge) => edge.to
	);
	for (const [unit, path] of paths) {
		for (const fact of model.units.get(unit)?.facts ?? []) {
			reached.push({ fact, path, unit });
		}
	}

	return reached;
}
