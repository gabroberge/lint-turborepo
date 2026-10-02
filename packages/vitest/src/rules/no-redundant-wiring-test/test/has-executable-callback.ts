import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * A callback that will run: a function, or a callback passed by identifier
 * or member. Spread arguments do not count.
 */
export function hasExecutableCallback(node: ESTree.CallExpression): boolean {
	return node.arguments.some((argument) => {
		if (argument.type === "SpreadElement") {
			return false;
		}

		const value = unwrapExpression(argument);
		return (
			value.type === "FunctionExpression" ||
			value.type === "ArrowFunctionExpression" ||
			value.type === "Identifier" ||
			value.type === "MemberExpression"
		);
	});
}
