/** Blank lines in a whitespace-only gap between two members: every line break past the first ends one. */
export function blankLinesInGap(gap: string): number {
	return Math.max(0, gap.split("\n").length - 2);
}
