import type { ESTree, SourceCode } from "@oxlint/plugins";

/**
 * Start of the statement, including comments on the lines above it. Snaps to
 * the beginning of the first of those lines.
 */
export function ownedStart(source: string, sourceCode: SourceCode, statement: ESTree.Statement): number {
	const comments = sourceCode.getCommentsBefore(statement);
	const anchor = comments[0] ?? statement;

	let start = anchor.range[0];
	while (start > 0 && source[start - 1] !== "\n") {
		start--;
	}

	return start;
}
