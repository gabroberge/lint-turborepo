import type { ReachedFact } from "../calls/reached-fact";
import { cachedReachedFacts } from "../calls/reached-facts";
import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import { escapedReads } from "./escaped-reads";
import { locationKey } from "./location-key";
import { outsideRole } from "./outside-role";

/** What `unitInterference` compares about one unit, from the facts reached while it runs. */
export interface UnitProfile {
	/** Reached accesses to tracked locations, in reached order, with their location key. */
	accesses: readonly (readonly [string, ReachedFact])[];
	/** The same accesses, by location key. */
	byLocation: ReadonlyMap<string, readonly ReachedFact[]>;
	/** Reached facts that run outside code or change state the model does not track. */
	effects: readonly ReachedFact[];
	/**
	 * Reached facts outside code could depend on: reads of state it could
	 * change, and writes of shared state that functions handed to outside
	 * code read (`escapedReads`).
	 */
	externals: readonly ReachedFact[];
	/** Reached facts after which the unit may touch anything. */
	opaque: readonly ReachedFact[];
	/** True when the unit touches anything at all: an access to state, or an opaque, effect or external fact. */
	touches: boolean;
}

const PROFILES = new WeakMap<ModuleModel, Map<UnitId, UnitProfile>>();

/** The profile of a unit, computed once per model and unit. */
export function unitProfile(model: ModuleModel, unit: UnitId): UnitProfile {
	let byUnit = PROFILES.get(model);
	if (byUnit === undefined) {
		byUnit = new Map();
		PROFILES.set(model, byUnit);
	}

	let profile = byUnit.get(unit);
	if (profile === undefined) {
		profile = buildProfile(model, cachedReachedFacts(model, unit));
		byUnit.set(unit, profile);
	}

	return profile;
}

function buildProfile(model: ModuleModel, facts: readonly ReachedFact[]): UnitProfile {
	const accesses: (readonly [string, ReachedFact])[] = [];
	const byLocation = new Map<string, ReachedFact[]>();
	const effects: ReachedFact[] = [];
	const externals: ReachedFact[] = [];
	const opaque: ReachedFact[] = [];
	let touchesState = false;
	for (const reached of facts) {
		const { fact } = reached;
		const role = outsideRole(model, fact);
		if (role === "opaque") {
			opaque.push(reached);
		} else if (role === "effect") {
			effects.push(reached);
		} else if (role === "external") {
			externals.push(reached);
		}

		if (fact.kind !== "access" || fact.target.kind === "unit") {
			continue;
		}

		touchesState = true;
		const key = locationKey(fact.target);
		if (key === null) {
			continue;
		}

		accesses.push([key, reached]);
		const bucket = byLocation.get(key);
		if (bucket === undefined) {
			byLocation.set(key, [reached]);
		} else {
			bucket.push(reached);
		}

		if (role === null && fact.mode === "write" && escapedReads(model).has(key)) {
			externals.push(reached);
		}
	}

	const touches = touchesState || opaque.length > 0 || effects.length > 0 || externals.length > 0;
	return { accesses, byLocation, effects, externals, opaque, touches };
}
