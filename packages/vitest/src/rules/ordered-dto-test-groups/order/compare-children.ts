import type { ClassifiedChild } from "../child/classify-child";

const GROUP_RANK = { property: 2, setup: 0, when: 1 } as const;

export function compareChildren(left: ClassifiedChild, right: ClassifiedChild): number {
	const rank = GROUP_RANK[left.kind] - GROUP_RANK[right.kind];
	if (rank !== 0) {
		return rank;
	}

	if (left.kind === "property" && right.kind === "property") {
		return left.title.localeCompare(right.title);
	}

	return 0;
}
