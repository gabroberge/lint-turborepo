import type { FunctionNode } from "@gabroberge/oxlint-estree";

export function callback(): FunctionNode {
	return { type: "ArrowFunctionExpression" } as FunctionNode;
}
