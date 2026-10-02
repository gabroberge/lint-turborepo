import type { PathSegment } from "./parse-segment";
import { parseSegment } from "./parse-segment";

export function tokenizePath(rawPath: string): PathSegment[] {
	const segments: PathSegment[] = [];

	for (const rawSegment of rawPath.split("/")) {
		if (rawSegment.length === 0) {
			continue;
		}

		segments.push(parseSegment(rawSegment));
	}

	return segments;
}
