import type { ESTree } from "@oxlint/plugins";

/**
 * Blank lines between two members, counted directly from their ranges.
 * Lines holding a comment are not blank, and members sharing a line have
 * none between them.
 */
export function blankLinesBetween(source: string, previous: ESTree.ClassElement, next: ESTree.ClassElement): number {
	const rows = source.slice(previous.range[1], next.range[0]).split("\n").slice(1, -1);
	return rows.filter((row) => row.trim() === "").length;
}
