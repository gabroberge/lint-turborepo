import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import { conflicts } from "./conflicts";
import type { Interference, InterferenceEvidence } from "./interference";
import type { UnitProfile } from "./unit-profile";
import { unitProfile } from "./unit-profile";

/**
 * Whether the order in which two units run may matter, judged from every
 * fact that may be reached while each runs (`reachedFacts`). All conflicting
 * accesses to tracked locations are listed; for uncertainty, every opaque
 * fact and the first pairing of outside effects are listed.
 *
 * - An opaque fact counts only against a unit that touches something (an
 *   access to state, or an opaque, effect or external fact): code that
 *   touches nothing, such as a pure function, cannot observe or change what
 *   the opaque code does.
 * - Outside effects pair an effect on one side with an effect or an external
 *   fact on the other. The classification (`outsideRole`) is a heuristic for
 *   order sensitivity between the two units, not a general fact about the
 *   code: an `external` read is one outside code could change, and an
 *   `external` write is one of a module binding, global or static member
 *   that a function handed to outside code reads, which outside code
 *   running on the other side could observe.
 *
 * The comparison is symmetric and does not consider when the units run:
 * whether they can run in a different order at all (two field initializers
 * of the same class, two methods called by a framework) is for the consumer
 * to decide. Results are computed from per-model caches: a model must not
 * be changed after it has been queried.
 */
export function unitInterference(model: ModuleModel, first: UnitId, second: UnitId): Interference {
	const firstProfile = unitProfile(model, first);
	const secondProfile = unitProfile(model, second);
	const definite = sameLocationEvidence(firstProfile, secondProfile);
	const possible: InterferenceEvidence[] = [
		...(secondProfile.touches ? firstProfile.opaque : []).map((fact) => ({
			first: fact,
			reason: "opaque" as const,
			second: null
		})),
		...(firstProfile.touches ? secondProfile.opaque : []).map((fact) => ({
			first: null,
			reason: "opaque" as const,
			second: fact
		})),
		...outsideEvidence(firstProfile, secondProfile)
	];
	const kind = definite.length > 0 ? "definite" : possible.length > 0 ? "possible" : "none";
	return { evidence: [...definite, ...possible], kind };
}

/** The first pairing of outside effects: an effect against an effect or an external fact, either way round. */
function outsideEvidence(first: UnitProfile, second: UnitProfile): InterferenceEvidence[] {
	const [firstEffect] = first.effects;
	const [secondEffect] = second.effects;
	const otherForFirst = secondEffect ?? second.externals[0];
	if (firstEffect !== undefined && otherForFirst !== undefined) {
		return [{ first: firstEffect, reason: "outside-effects", second: otherForFirst }];
	}

	const [firstExternal] = first.externals;
	if (secondEffect !== undefined && firstExternal !== undefined) {
		return [{ first: firstExternal, reason: "outside-effects", second: secondEffect }];
	}

	return [];
}

/** Every conflicting pair of accesses to one location, in the order of the first side, then the second. */
function sameLocationEvidence(first: UnitProfile, second: UnitProfile): InterferenceEvidence[] {
	const evidence: InterferenceEvidence[] = [];
	for (const [key, left] of first.accesses) {
		for (const right of second.byLocation.get(key) ?? []) {
			if (left.fact.kind === "access" && right.fact.kind === "access" && conflicts(left.fact, right.fact)) {
				evidence.push({ first: left, reason: "same-location", second: right });
			}
		}
	}

	return evidence;
}
