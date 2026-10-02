import { cachedReachedFacts } from "../calls/reached-facts";
import { runningEdgesFrom } from "../calls/running-edges-from";
import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import { locationKey } from "./location-key";

const ESCAPED = new WeakMap<ModuleModel, ReadonlySet<string>>();

/**
 * The keys (see `locationKey`) of the shared locations that functions handed
 * to code outside the model may read, transitively: module and imported
 * bindings, globals and class members read, called or constructed while
 * such a function runs. A function is handed on when it is passed to
 * unknown code or to an assumed factory (which may run it later), or when a
 * method or function is read as a value.
 *
 * Instance members are included by key: the model does not know which
 * instance a callback reads through, so it assumes it may be the one another
 * unit writes (as it is for an arrow capturing `this` in a field
 * initializer). This over-approximates across instances.
 */
export function escapedReads(model: ModuleModel): ReadonlySet<string> {
	const cached = ESCAPED.get(model);
	if (cached !== undefined) {
		return cached;
	}

	const keys = new Set<string>();
	for (const unit of escapedUnits(model)) {
		for (const { fact } of cachedReachedFacts(model, unit)) {
			if (fact.kind !== "access" || fact.mode === "write") {
				continue;
			}

			const key = locationKey(fact.target);
			if (key !== null) {
				keys.add(key);
			}
		}
	}

	ESCAPED.set(model, keys);
	return keys;
}

function escapedUnits(model: ModuleModel): Set<UnitId> {
	const escaped = new Set<UnitId>();
	for (const unit of model.units.values()) {
		for (const fact of unit.facts) {
			if (
				fact.kind === "function" &&
				(fact.disposition === "passed-to-unknown" || fact.disposition === "passed-to-assumed")
			) {
				escaped.add(fact.unit);
			}
		}

		for (const edge of runningEdgesFrom(model, unit.id)) {
			if (edge.kind === "may-run" && edge.fact?.kind === "access") {
				escaped.add(edge.to);
			}
		}
	}

	return escaped;
}
