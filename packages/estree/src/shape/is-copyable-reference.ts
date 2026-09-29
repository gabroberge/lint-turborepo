import type { ESTree } from "@oxlint/plugins";

import { unwrapExpression } from "../unwrap/unwrap-expression";

const copyableTypes = new Set(["Identifier", "MemberExpression", "ThisExpression"]);

export function isCopyableReference(expression: ESTree.Expression): boolean {
	const node = unwrapExpression(expression);
	return copyableTypes.has(node.type);
}
