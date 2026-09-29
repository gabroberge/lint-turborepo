import type { ESTree } from "@oxlint/plugins";

import { unwrapExpression } from "./unwrap-expression";

export function unwrapAwaitedExpression(node: ESTree.Expression): ESTree.Expression;
export function unwrapAwaitedExpression(node: ESTree.Node): ESTree.Node;
export function unwrapAwaitedExpression(node: ESTree.Node): ESTree.Node {
	let current = unwrapExpression(node);

	while (current.type === "AwaitExpression") {
		current = unwrapExpression(current.argument);
	}

	return current;
}
