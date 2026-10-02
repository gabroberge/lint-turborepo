import type { ESTree } from "@oxlint/plugins";

export function call(name: string, args: object[]): ESTree.CallExpression {
	return {
		arguments: args,
		callee: { name, type: "Identifier" },
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
