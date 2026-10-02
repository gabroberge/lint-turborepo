import type { Conflict } from "../conflict/conflict";
import type { AnalyzedMember } from "../member/analyzed-member";
import type { BlockedMove } from "./blocked-move";

/**
 * Pairs the preferred order would swap but whose initializers may interact
 * in a way the analysis cannot rule out. A pair already chained by definite
 * dependencies is not reported: no order could swap it. Each later member
 * is reported once, against the first member holding it back.
 */
export function blockedMoves<Member extends AnalyzedMember>(
	members: readonly Member[],
	compare: (left: Member, right: Member) => number,
	conflictAt: (earlier: AnalyzedMember, later: AnalyzedMember) => Conflict
): BlockedMove<Member>[] {
	const reachable = new Map<Member, Set<Member>>(members.map((member) => [member, new Set()]));
	for (const [index, earlier] of [...members.entries()].toReversed()) {
		const reached = reachable.get(earlier);
		for (const later of members.slice(index + 1)) {
			if (conflictAt(earlier, later) === "definite") {
				reached?.add(later);
				for (const next of reachable.get(later) ?? []) {
					reached?.add(next);
				}
			}
		}
	}

	const moves: BlockedMove<Member>[] = [];
	for (const [index, later] of members.entries()) {
		const earlier = members
			.slice(0, index)
			.find(
				(candidate) =>
					compare(later, candidate) < 0 &&
					conflictAt(candidate, later) === "uncertain" &&
					reachable.get(candidate)?.has(later) !== true
			);
		if (earlier !== undefined) {
			moves.push({ earlier, later });
		}
	}

	return moves;
}
