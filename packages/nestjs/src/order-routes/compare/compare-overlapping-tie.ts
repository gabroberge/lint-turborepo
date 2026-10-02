import { compareSwallowedMethod } from "../method/compare-swallowed-method";
import { patternsCanMatch } from "../path/patterns-can-match";
import { methodRank } from "./method-rank";
import type { RouteSortKey } from "./route-sort-key";

export function compareOverlappingTie(left: RouteSortKey, right: RouteSortKey, methodOrder: readonly string[]): number {
	if (patternsCanMatch(left.path, right.path)) {
		const swallowDelta = compareSwallowedMethod(left.method, right.method);
		if (swallowDelta !== 0) {
			return swallowDelta;
		}
	}

	return methodRank(left.method, methodOrder) - methodRank(right.method, methodOrder);
}
