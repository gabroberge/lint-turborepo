import type { ESTree } from "@oxlint/plugins";

import { unwrapExpression } from "../unwrap/unwrap-expression";
import { isSideEffectFreeProperty } from "./is-side-effect-free-property";

const sideEffectFreeTypes = new Set(["Identifier", "Literal", "ThisExpression"]);

export function isSideEffectFree(expression: ESTree.Expression): boolean {
	const node = unwrapExpression(expression);
	if (sideEffectFreeTypes.has(node.type)) {
		return true;
	}

	if (node.type === "MemberExpression") {
		return isSideEffectFree(node.object) && isSideEffectFreeProperty(node);
	}

	return false;
}
