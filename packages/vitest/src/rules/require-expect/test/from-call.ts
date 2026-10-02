import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { isTestFactoryCall, isTodoTestCall, testCallbackFromCall, testFunctionName } from "../../../test-call";

export interface ExecutableTest {
	callback: FunctionNode;
	callee: "it" | "test";
	node: ESTree.CallExpression;
}

/**
 * The inline `it` / `test` callback this rule inspects.
 *
 * Factory calls (`skipIf`, `runIf`, `each`, `for`) are not the test. `todo`
 * is a declaration, even when a callback is written. A call with no inline
 * function (`it.skip("title")`, or a callback passed by identifier) has
 * nothing to inspect.
 */
export function executableTestFromCall(node: ESTree.CallExpression): ExecutableTest | null {
	if (isTestFactoryCall(node) || isTodoTestCall(node.callee)) {
		return null;
	}

	const callee = testFunctionName(node.callee);
	if (callee === null) {
		return null;
	}

	const callback = testCallbackFromCall(node);
	if (callback === null) {
		return null;
	}

	return { callback, callee, node };
}
