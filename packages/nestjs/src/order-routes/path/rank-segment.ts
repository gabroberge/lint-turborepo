import type { PathSegment } from "./parse-segment";

const SEGMENT_RANK = {
	literal: 1,
	missing: 0,
	param: 2,
	wildcard: 3
} as const;

export function rankSegment(segment: PathSegment | undefined): number {
	if (segment === undefined) {
		return SEGMENT_RANK.missing;
	}

	return SEGMENT_RANK[segment.kind];
}
