import type { ESTree } from "@oxlint/plugins";

export function callExpression(
	callee: ESTree.CallExpression["callee"],
	args: ESTree.Argument[] = []
): ESTree.CallExpression {
	return { arguments: args, callee, type: "CallExpression" } as unknown as ESTree.CallExpression;
}
