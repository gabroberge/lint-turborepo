import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { startsWithWhen } from "./starts-with-when";

/**
 * The title argument when its static text starts with the word `when`.
 * Missing, spread, dynamic, and non-leading `when` titles are `null`.
 *
 * Returns the original argument, including parentheses, so the report points
 * at the title as written.
 */
export function leadingWhenTitle(
	argument: ESTree.CallExpression["arguments"][number] | undefined
): ESTree.Expression | null {
	if (argument === undefined || argument.type === "SpreadElement") {
		return null;
	}

	if (!startsWithWhen(unwrapExpression(argument))) {
		return null;
	}

	return argument;
}
