import type { ESTree } from "@oxlint/plugins";

import { isArrangeExpression } from "./is-arrange-expression";
import { isSpyOnExpression } from "./is-spy-on-expression";

/**
 * Whether this direct-body statement or declarator is arrange. Bare `spyOn`
 * is arrange as a statement or assignment; `const spy = vi.spyOn(...)` is
 * not, unless the chain also configures the mock.
 */
export function isArrangeAt(node: ESTree.ExpressionStatement | ESTree.VariableDeclarator): boolean {
	if (node.type === "VariableDeclarator") {
		return node.init !== null && isArrangeExpression(node.init);
	}

	const expression = node.expression;
	if (expression.type === "AssignmentExpression") {
		return isArrangeExpression(expression.right) || isSpyOnExpression(expression.right);
	}

	return isArrangeExpression(expression) || isSpyOnExpression(expression);
}
