import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * Returns the number of cases when `table` is a static array with no spreads.
 * Returns null when the table is not a static array.
 */
export function staticCaseCount(table: ESTree.Expression | ESTree.SpreadElement | undefined): number | null {
	if (table === undefined || table.type === "SpreadElement") {
		return null;
	}

	const unwrapped = unwrapExpression(table);
	if (unwrapped.type !== "ArrayExpression") {
		return null;
	}

	if (unwrapped.elements.some((element) => element !== null && element.type === "SpreadElement")) {
		return null;
	}

	return unwrapped.elements.length;
}
