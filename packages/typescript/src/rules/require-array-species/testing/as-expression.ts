import type { ESTree } from "@oxlint/plugins";

export function asExpression(expression: ESTree.Expression): ESTree.TSAsExpression {
	return { expression, type: "TSAsExpression" } as ESTree.TSAsExpression;
}
