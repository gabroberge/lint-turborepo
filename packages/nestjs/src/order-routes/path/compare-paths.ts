import { rankSegment } from "./rank-segment";
import { tokenizePath } from "./tokenize-path";

export function comparePaths(leftPath: string, rightPath: string): number {
	const leftSegments = tokenizePath(leftPath);
	const rightSegments = tokenizePath(rightPath);
	const length = Math.max(leftSegments.length, rightSegments.length);

	for (let index = 0; index < length; index++) {
		const leftRank = rankSegment(leftSegments[index]);
		const rightRank = rankSegment(rightSegments[index]);
		if (leftRank !== rightRank) {
			return leftRank - rightRank;
		}
	}

	return 0;
}
