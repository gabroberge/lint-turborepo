import type { Effects } from "../effects/effects";
import type { AnalyzedMember } from "../member/analyzed-member";
import type { Conflict } from "./conflict";
import { conflictBetween } from "./conflict-between";

/**
 * A memoized lookup of the conflict between two members. Members that run
 * nothing, or run in different timelines, never conflict: instance
 * initializers run on construction, long after the static ones.
 */
export function conflictTable(
	members: readonly AnalyzedMember[],
	effects: readonly (Effects | null)[]
): (earlier: AnalyzedMember, later: AnalyzedMember) => Conflict {
	const cache = new Map<number, Conflict>();

	return (earlier, later) => {
		const id = earlier.index * members.length + later.index;
		const cached = cache.get(id);
		if (cached !== undefined) {
			return cached;
		}

		const leftEffects = effects[earlier.index];
		const rightEffects = effects[later.index];
		const conflict =
			leftEffects != null && rightEffects != null && earlier.timeline === later.timeline
				? conflictBetween(earlier, leftEffects, later, rightEffects)
				: "none";

		cache.set(id, conflict);
		return conflict;
	};
}
