import type { FunctionNode } from "@gabroberge/oxlint-estree";

export function arrowFunction(): FunctionNode {
	return {
		async: false,
		body: { body: [], type: "BlockStatement" },
		expression: false,
		generator: false,
		params: [],
		type: "ArrowFunctionExpression"
	} as unknown as FunctionNode;
}
