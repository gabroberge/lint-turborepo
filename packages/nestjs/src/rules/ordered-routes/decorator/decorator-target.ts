import type { ESTree } from "@oxlint/plugins";

export function decoratorTarget(expression: ESTree.Expression): ESTree.Expression {
	if (expression.type === "CallExpression") {
		return expression.callee;
	}

	return expression;
}
