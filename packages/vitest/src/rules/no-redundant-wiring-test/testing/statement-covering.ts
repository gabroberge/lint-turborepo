import type { ESTree } from "@oxlint/plugins";

export function statementCovering(source: string, snippet: string): ESTree.ExpressionStatement {
	const start = source.indexOf(snippet);

	return {
		range: [start, start + snippet.length],
		type: "ExpressionStatement"
	} as ESTree.ExpressionStatement;
}
