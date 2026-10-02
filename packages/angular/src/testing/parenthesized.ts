import type { ESTree } from "@oxlint/plugins";

export function parenthesized(expression: ESTree.Expression): ESTree.ParenthesizedExpression {
	return { expression, type: "ParenthesizedExpression" } as ESTree.ParenthesizedExpression;
}
