import type { ESTree } from "@oxlint/plugins";

import { isTransparent } from "./is-transparent";

export function unwrapExpression(node: ESTree.Expression): ESTree.Expression;
export function unwrapExpression(node: ESTree.Node): ESTree.Node;
export function unwrapExpression(node: ESTree.Node): ESTree.Node {
	let current = node;

	while (isTransparent(current)) {
		current = current.expression;
	}

	return current;
}
