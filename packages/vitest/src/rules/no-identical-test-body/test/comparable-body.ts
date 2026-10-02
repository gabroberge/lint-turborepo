import type { ESTree } from "@oxlint/plugins";

import { isTestFactoryCall, testCallbackFromCall, testFunctionName } from "../../../test-call";

/**
 * The written callback body of a recognized `it` / `test`, or `null` when the
 * call is not compared: a factory (`each`, `for`, `skipIf`, `runIf`), an
 * unrecognized callee, or no inline callback.
 *
 * `async` and the parameter list are not part of the returned node.
 */
export function comparableBodyFromCall(node: ESTree.CallExpression): ESTree.Node | null {
	if (isTestFactoryCall(node)) {
		return null;
	}

	if (testFunctionName(node.callee) === null) {
		return null;
	}

	const callback = testCallbackFromCall(node);
	if (callback?.body == null) {
		return null;
	}

	return callback.body;
}
