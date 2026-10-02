import { unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { singleOwnKey } from "./single-own-key";

/**
 * The one key shared by every static object row of an `.each` table.
 * A spread, a non-object row, or mixed keys is not isolated coverage.
 */
export function isolatedTableProperty(table: ESTree.Expression): string | null {
	const unwrapped = unwrapAwaitedExpression(table);
	if (unwrapped.type !== "ArrayExpression" || unwrapped.elements.length === 0) {
		return null;
	}

	let property: string | null = null;
	for (const element of unwrapped.elements) {
		if (element === null || element.type === "SpreadElement") {
			return null;
		}

		const expression = unwrapAwaitedExpression(element);
		if (expression.type !== "ObjectExpression") {
			return null;
		}

		const name = singleOwnKey(expression);
		if (name === null) {
			return null;
		}

		if (property !== null && property !== name) {
			return null;
		}

		property = name;
	}

	return property;
}
