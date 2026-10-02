import type { FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { testCallbackFromCall } from "../../../test-call";
import { isMinimalWiringBody } from "../wiring/is-minimal-wiring-body";
import { isExecutableTest } from "./is-executable-test";

export interface RecordedTest {
	node: ESTree.CallExpression;
	statement: ESTree.ExpressionStatement | null;
	suite: FunctionNode | null;
	wiring: boolean;
}

/**
 * An executable `it` / `test` call, classified as a wiring body or not and
 * attached to the statement that owns the call. Non-executable calls are
 * not recorded.
 */
export function recordExecutableTest(
	node: ESTree.CallExpression,
	suite: FunctionNode | null,
	statement: ESTree.ExpressionStatement | null
): RecordedTest | null {
	if (!isExecutableTest(node)) {
		return null;
	}

	const callback = testCallbackFromCall(node);
	return {
		node,
		statement,
		suite,
		wiring: callback !== null && isMinimalWiringBody(callback)
	};
}
