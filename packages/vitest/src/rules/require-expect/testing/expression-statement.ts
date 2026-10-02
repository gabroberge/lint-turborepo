import type { ESTree } from "@oxlint/plugins";

export function expressionStatement(expression: object): ESTree.ExpressionStatement {
	return { expression, type: "ExpressionStatement" } as unknown as ESTree.ExpressionStatement;
}
