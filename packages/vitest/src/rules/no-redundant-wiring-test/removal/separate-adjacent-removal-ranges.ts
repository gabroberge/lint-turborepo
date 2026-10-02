import { withoutTrailingNewline } from "./without-trailing-newline";

/**
 * Leave a newline between two neighboring removal ranges so ESLint can apply
 * both adjacent fixes.
 */
export function separateAdjacentRemovalRanges(source: string, ranges: [number, number][]): void {
	for (let index = 0; index < ranges.length - 1; index++) {
		const current = ranges[index];
		const next = ranges[index + 1];
		if (current?.[1] === next?.[0] && current !== undefined && next !== undefined) {
			current[1] = withoutTrailingNewline(source, current[1]);
		}
	}
}
