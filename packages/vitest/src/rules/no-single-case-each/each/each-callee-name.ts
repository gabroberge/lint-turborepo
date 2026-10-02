import type { ESTree } from "@oxlint/plugins";

import { describeFunctionName, testFunctionName } from "../../../test-call";

/**
 * Names the `it` / `test` / `describe` behind a `.each` member.
 * `.for` and computed access are not `.each`.
 */
export function eachCalleeName(callee: ESTree.Node): "describe" | "it" | "test" | null {
	if (callee.type !== "MemberExpression" || callee.computed || callee.property.type !== "Identifier") {
		return null;
	}

	if (callee.property.name !== "each") {
		return null;
	}

	return testFunctionName(callee) ?? describeFunctionName(callee);
}
