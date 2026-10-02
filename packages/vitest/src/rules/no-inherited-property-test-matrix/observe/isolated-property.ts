import { unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { EachRow } from "./each-row-of";
import { isolatedRowProperty } from "./isolated-row-property";
import { singleOwnKey } from "./single-own-key";

/**
 * The one property an instantiation input covers on its own: a single-key
 * object literal, or the `.each` row parameter when every static row shares
 * that key. A local rebinding of the row hides the table.
 */
export function isolatedProperty(input: ESTree.Node, eachRow: EachRow | null): string | null {
	const unwrapped = unwrapAwaitedExpression(input);
	if (unwrapped.type === "ObjectExpression") {
		return singleOwnKey(unwrapped);
	}

	if (unwrapped.type === "Identifier" && eachRow !== null) {
		return isolatedRowProperty(unwrapped.name, eachRow);
	}

	return null;
}
