import type { ESTree } from "@oxlint/plugins";

export function arrowFunction(): ESTree.ArrowFunctionExpression {
	return {
		async: false,
		body: { body: [], type: "BlockStatement" },
		expression: false,
		generator: false,
		params: [],
		type: "ArrowFunctionExpression"
	} as unknown as ESTree.ArrowFunctionExpression;
}
