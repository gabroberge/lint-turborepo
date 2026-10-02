import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function arrow(body: ESTree.BlockStatement | ESTree.Expression): FunctionNode {
	return {
		async: false,
		body,
		expression: body.type !== "BlockStatement",
		generator: false,
		params: [],
		type: "ArrowFunctionExpression"
	} as unknown as FunctionNode;
}
