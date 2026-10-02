import type { ESTree } from "@oxlint/plugins";

export function expressionStatement(expression: ESTree.Expression): ESTree.ExpressionStatement {
	return { expression, type: "ExpressionStatement" } as ESTree.ExpressionStatement;
}
