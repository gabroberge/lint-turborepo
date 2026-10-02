import { identifierName, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * The identifier named by a field initializer call, after unwrapping
 * parentheses and type assertions. Member callees such as `core.resource`
 * are ignored.
 */
export function initializerCalleeName(value: ESTree.Expression | null): string | null {
	if (value === null) {
		return null;
	}

	const expression = unwrapExpression(value);
	if (expression.type !== "CallExpression") {
		return null;
	}

	return identifierName(unwrapExpression(expression.callee));
}
