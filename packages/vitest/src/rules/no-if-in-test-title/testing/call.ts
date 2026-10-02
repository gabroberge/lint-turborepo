import type { ESTree } from "@oxlint/plugins";

export function call(callee: object, args: object[]): ESTree.CallExpression {
	return {
		arguments: args,
		callee,
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
