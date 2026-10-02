import { type FunctionNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { isDescribeFactoryCall } from "./describe-factory-call";
import { describeFunctionName } from "./describe-function-name";
import { lastFunctionArgument } from "./last-function-argument";

export function describeCallbackFromCall(node: ESTree.CallExpression): FunctionNode | null {
	if (isDescribeFactoryCall(node)) {
		return null;
	}
	if (describeFunctionName(node.callee) === null) {
		return null;
	}

	return lastFunctionArgument(node);
}
