import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "../import/collect-import";
import { isBoundException } from "../import/is-bound-exception";

export function isTypeOnlyGenericException(argument: ESTree.Expression, bindings: Map<string, Binding>): boolean {
	const unwrapped = unwrapExpression(argument);

	if (unwrapped.type === "NewExpression") {
		if (unwrapped.arguments.length > 0) {
			return false;
		}

		return isBoundException(unwrapExpression(unwrapped.callee), bindings);
	}

	return isBoundException(unwrapped, bindings);
}
