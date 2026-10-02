import { unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/** Length of a static array table with no holes or spreads. */
export function staticCaseCount(table: ESTree.Expression): number | null {
	const unwrapped = unwrapAwaitedExpression(table);
	if (unwrapped.type !== "ArrayExpression") {
		return null;
	}

	for (const element of unwrapped.elements) {
		if (element === null || element.type === "SpreadElement") {
			return null;
		}
	}

	return unwrapped.elements.length;
}
