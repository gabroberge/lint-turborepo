import type { FunctionNode } from "@gabroberge/oxlint-estree";

export function functionNode(): FunctionNode {
	return { type: "ArrowFunctionExpression" } as FunctionNode;
}
