import { type FunctionNode, unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function testCallbackFromCall(node: ESTree.CallExpression): FunctionNode | null {
	for (let index = node.arguments.length - 1; index >= 0; index--) {
		const argument = node.arguments[index];
		if (argument === undefined || argument.type === "SpreadElement") {
			continue;
		}

		const unwrapped = unwrapAwaitedExpression(argument);
		if (unwrapped.type === "FunctionExpression" || unwrapped.type === "ArrowFunctionExpression") {
			return unwrapped;
		}
	}

	return null;
}
