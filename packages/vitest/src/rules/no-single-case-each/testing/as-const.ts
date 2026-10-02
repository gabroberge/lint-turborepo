import type { ESTree } from "@oxlint/plugins";

export function asConst(expression: ESTree.Expression): ESTree.TSAsExpression {
	return { expression, type: "TSAsExpression" } as unknown as ESTree.TSAsExpression;
}
