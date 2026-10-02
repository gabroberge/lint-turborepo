import { isCopyableReferenceTo, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * True when `expected` is an object or array whose only contents are a spread
 * of a copyable reference identical to `actual`.
 */
export function isSoleSpreadOfActual(actual: ESTree.Expression, expected: ESTree.Expression): boolean {
	const expectedCore = unwrapExpression(expected);

	if (expectedCore.type === "ObjectExpression" && expectedCore.properties.length === 1) {
		const only = expectedCore.properties[0];
		if (only?.type === "SpreadElement") {
			return isCopyableReferenceTo(only.argument, actual);
		}
	}

	if (expectedCore.type === "ArrayExpression" && expectedCore.elements.length === 1) {
		const only = expectedCore.elements[0];
		if (only?.type === "SpreadElement") {
			return isCopyableReferenceTo(only.argument, actual);
		}
	}

	return false;
}
