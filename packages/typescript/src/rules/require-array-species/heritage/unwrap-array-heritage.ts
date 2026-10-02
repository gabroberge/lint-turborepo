import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function unwrapArrayHeritage(node: ESTree.Expression): ESTree.Expression {
	let current = unwrapExpression(node);

	while (current.type === "TSInstantiationExpression") {
		current = unwrapExpression(current.expression);
	}

	return current;
}
