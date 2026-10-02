import { staticKey } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/** The only static key of an object literal. Spreads, computed keys, or several keys are not isolated. */
export function singleOwnKey(expression: ESTree.ObjectExpression): string | null {
	let property: string | null = null;

	for (const element of expression.properties) {
		if (element.type !== "Property" || element.computed) {
			return null;
		}

		const name = staticKey(element.key);
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
