import { tokenizePath } from "./tokenize-path";

/**
 * Whether two Express-style patterns can match the same request.
 *
 * Same segment count, and no pair of literals that disagree. Parameters and
 * wildcards match any text, so they do not create a conflict.
 */
export function patternsCanMatch(leftPath: string, rightPath: string): boolean {
	const leftSegments = tokenizePath(leftPath);
	const rightSegments = tokenizePath(rightPath);
	if (leftSegments.length !== rightSegments.length) {
		return false;
	}

	for (let index = 0; index < leftSegments.length; index++) {
		const left = leftSegments[index];
		const right = rightSegments[index];
		if (left === undefined || right === undefined) {
			return false;
		}

		if (left.kind === "literal" && right.kind === "literal" && left.value !== right.value) {
			return false;
		}
	}

	return true;
}
