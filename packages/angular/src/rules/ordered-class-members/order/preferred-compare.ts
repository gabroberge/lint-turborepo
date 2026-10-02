import type { ClassMember } from "../member/class-member";
import type { ResolvedOptions } from "../options/resolved-options";
import { compareNames } from "./compare-names";
import { sortName } from "./sort-name";
import { visibilityRank } from "./visibility-rank";

/**
 * The preferred order, ignoring initialization constraints: group, then
 * visibility, then name (unless the group keeps source order), then source
 * position. It is a total order, so sorting with it is deterministic.
 */
export function preferredCompare(options: ResolvedOptions): (left: ClassMember, right: ClassMember) => number {
	return (left, right) => {
		const leftGroup = options.groupOf(left.category);
		const rightGroup = options.groupOf(right.category);
		if (leftGroup.index !== rightGroup.index) {
			return leftGroup.index - rightGroup.index;
		}

		const visibility = visibilityRank(options, left) - visibilityRank(options, right);
		if (visibility !== 0) {
			return visibility;
		}

		if (leftGroup.order === "alphabetical") {
			const name = compareNames(sortName(left), sortName(right));
			if (name !== 0) {
				return name;
			}
		}

		return left.index - right.index;
	};
}
