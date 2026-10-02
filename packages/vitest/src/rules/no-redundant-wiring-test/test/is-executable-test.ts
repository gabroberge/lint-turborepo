import type { ESTree } from "@oxlint/plugins";

import { isTestFactoryCall, isTodoTestCall, testFunctionName } from "../../../test-call";
import { hasExecutableCallback } from "./has-executable-callback";

/**
 * A call that will run as `it` / `test`. Factory calls are not the test.
 * `todo` is a declaration, with or without a callback. A callback passed by
 * identifier or member still counts. A call with no callback does not.
 */
export function isExecutableTest(node: ESTree.CallExpression): boolean {
	if (isTestFactoryCall(node) || isTodoTestCall(node.callee)) {
		return false;
	}

	if (testFunctionName(node.callee) === null) {
		return false;
	}

	return hasExecutableCallback(node);
}
