import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { describeFunctionName, isDescribeFactoryCall, isTestFactoryCall, testFunctionName } from "../../../test-call";

export interface DescribeOrTestCall {
	call: ESTree.CallExpression;
	kind: "describe" | "test";
}

/**
 * The `describe` or `it` / `test` call this statement is, or null when it is
 * not one. Factory calls (`skipIf`, `runIf`, `each`, `for`) are not titled
 * calls; the call that receives the title is.
 */
export function describeOrTestCall(statement: ESTree.Statement): DescribeOrTestCall | null {
	if (statement.type !== "ExpressionStatement") {
		return null;
	}

	const expression = unwrapExpression(statement.expression);
	if (expression.type !== "CallExpression") {
		return null;
	}

	if (!isDescribeFactoryCall(expression) && describeFunctionName(expression.callee) !== null) {
		return { call: expression, kind: "describe" };
	}

	if (!isTestFactoryCall(expression) && testFunctionName(expression.callee) !== null) {
		return { call: expression, kind: "test" };
	}

	return null;
}
