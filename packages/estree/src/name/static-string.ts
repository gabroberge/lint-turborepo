import type { ESTree } from "@oxlint/plugins";

import { unwrapExpression } from "../unwrap/unwrap-expression";

export function staticString(expression: ESTree.Expression): string | null {
	const unwrapped = unwrapExpression(expression);
	if (unwrapped.type === "Literal" && typeof unwrapped.value === "string") {
		return unwrapped.value;
	}

	if (unwrapped.type === "TemplateLiteral" && unwrapped.expressions.length === 0) {
		return unwrapped.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join("");
	}

	return null;
}
