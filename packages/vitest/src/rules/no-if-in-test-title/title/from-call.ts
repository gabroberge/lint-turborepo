import type { ESTree } from "@oxlint/plugins";

import { isTestFactoryCall, testFunctionName } from "../../../test-call";

export interface TestTitle {
	callee: "it" | "test";
	title: ESTree.Expression;
}

/**
 * The title argument of an `it` / `test` call, or null when this call is not a
 * titled test. Factory calls (`skipIf`, `runIf`, `each`, `for`) receive a
 * condition or table, not a title. `describe` is ignored.
 */
export function testTitleFromCall(node: ESTree.CallExpression): TestTitle | null {
	if (isTestFactoryCall(node)) {
		return null;
	}

	const callee = testFunctionName(node.callee);
	if (callee === null) {
		return null;
	}

	const title = node.arguments[0];
	if (title === undefined || title.type === "SpreadElement") {
		return null;
	}

	return { callee, title };
}
