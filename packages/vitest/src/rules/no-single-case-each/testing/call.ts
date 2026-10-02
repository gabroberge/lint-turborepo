import type { ESTree } from "@oxlint/plugins";

export function call(callee: ESTree.Expression, argument?: ESTree.Expression): ESTree.CallExpression {
	return {
		arguments: argument === undefined ? [] : [argument],
		callee,
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
