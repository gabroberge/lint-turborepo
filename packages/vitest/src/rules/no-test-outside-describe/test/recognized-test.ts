import type { ESTree } from "@oxlint/plugins";

import { isTestFactoryCall, testFunctionName } from "../../../test-call";

/**
 * The call that receives the title is the test. Factory calls
 * (`it.skipIf`, `it.runIf`, `it.each`, `it.for`) are not.
 */
export function recognizedTestName(node: ESTree.CallExpression): "it" | "test" | null {
	if (isTestFactoryCall(node)) {
		return null;
	}

	return testFunctionName(node.callee);
}
