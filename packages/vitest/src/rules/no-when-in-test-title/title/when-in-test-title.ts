import { staticTextMatches, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { isTestFactoryCall, testFunctionName } from "../../../test-call";

const WHEN_WORD = /\bwhen\b/iu;

export interface WhenInTestTitle {
	callee: "it" | "test";
	title: ESTree.Expression;
}

/**
 * A titled `it` / `test` whose static title contains the word `when`.
 * Factory calls are not titled tests.
 */
export function whenInTestTitle(node: ESTree.CallExpression): WhenInTestTitle | null {
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

	if (!staticTextMatches(unwrapExpression(title), WHEN_WORD)) {
		return null;
	}

	return { callee, title };
}
