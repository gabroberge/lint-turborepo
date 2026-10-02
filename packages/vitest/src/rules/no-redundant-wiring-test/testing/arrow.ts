import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function arrow(body?: ESTree.BlockStatement | ESTree.Expression): FunctionNode {
	const resolvedBody = body ?? ({ body: [], type: "BlockStatement" } as unknown as ESTree.BlockStatement);

	return {
		async: false,
		body: resolvedBody,
		expression: resolvedBody.type !== "BlockStatement",
		generator: false,
		params: [],
		type: "ArrowFunctionExpression"
	} as unknown as FunctionNode;
}
