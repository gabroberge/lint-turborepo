import type { ReachedFact } from "../calls/reached-fact";
import { reachedFacts } from "../calls/reached-facts";
import type { UnitId } from "../model/ids";
import type { ModuleModel } from "../model/module-model";
import { conflicts } from "./conflicts";
import type { Interference, InterferenceEvidence } from "./interference";
import { outsideRole } from "./outside-role";

interface Roles {
	effects: ReachedFact[];
	externals: ReachedFact[];
	opaque: ReachedFact[];
}

/**
 * Whether the order in which two units run may matter, judged from every
 * fact that may be reached while each runs (`reachedFacts`). All conflicting
 * accesses to tracked locations are listed; for uncertainty, every opaque
 * fact and the first pairing of outside effects are listed.
 *
 * The comparison is symmetric and does not consider when the units run:
 * whether they can run in a different order at all (two field initializers
 * of the same class, two methods called by a framework) is for the consumer
 * to decide.
 */
export function unitInterference(model: ModuleModel, first: UnitId, second: UnitId): Interference {
	const firstFacts = reachedFacts(model, first);
	const secondFacts = reachedFacts(model, second);
	const firstRoles = rolesOf(model, firstFacts);
	const secondRoles = rolesOf(model, secondFacts);
	const definite = sameLocationEvidence(firstFacts, secondFacts);
	const possible: InterferenceEvidence[] = [
		...firstRoles.opaque.map((fact) => ({ first: fact, reason: "opaque" as const, second: null })),
		...secondRoles.opaque.map((fact) => ({ first: null, reason: "opaque" as const, second: fact })),
		...outsideEvidence(firstRoles, secondRoles)
	];
	const kind = definite.length > 0 ? "definite" : possible.length > 0 ? "possible" : "none";
	return { evidence: [...definite, ...possible], kind };
}

/** The first pairing of outside effects: an effect against an effect or an external read, either way round. */
function outsideEvidence(first: Roles, second: Roles): InterferenceEvidence[] {
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

function rolesOf(model: ModuleModel, facts: readonly ReachedFact[]): Roles {
	const roles: Roles = { effects: [], externals: [], opaque: [] };
	for (const reached of facts) {
		const role = outsideRole(model, reached.fact);
		if (role === "opaque") {
			roles.opaque.push(reached);
		} else if (role === "effect") {
			roles.effects.push(reached);
		} else if (role === "external") {
			roles.externals.push(reached);
		}
	}

	return roles;
}

function sameLocationEvidence(first: readonly ReachedFact[], second: readonly ReachedFact[]): InterferenceEvidence[] {
	const evidence: InterferenceEvidence[] = [];
	for (const left of first) {
		for (const right of second) {
			if (left.fact.kind === "access" && right.fact.kind === "access" && conflicts(left.fact, right.fact)) {
				evidence.push({ first: left, reason: "same-location", second: right });
			}
		}
	}

	return evidence;
}
