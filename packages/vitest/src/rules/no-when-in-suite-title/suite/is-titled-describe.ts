import type { ESTree } from "@oxlint/plugins";

import { describeFunctionName, isDescribeFactoryCall } from "../../../test-call";

/**
 * The call that receives the suite title is the describe. Factory calls
 * (`skipIf`, `runIf`, `each`, `for`) receive a condition or table, not a title.
 */
export function isTitledDescribe(node: ESTree.CallExpression): boolean {
	if (isDescribeFactoryCall(node)) {
		return false;
	}

	return describeFunctionName(node.callee) !== null;
}
