import type { ESTree } from "@oxlint/plugins";

import type { FunctionNode } from "./function-node";

const functionTypes = new Set(["ArrowFunctionExpression", "FunctionDeclaration", "FunctionExpression"]);

export function isFunctionNode(node: ESTree.Node): node is FunctionNode {
	return functionTypes.has(node.type);
}
