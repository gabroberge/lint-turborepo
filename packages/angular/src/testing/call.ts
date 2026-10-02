import type { ESTree } from "@oxlint/plugins";

export function call(name: string): ESTree.CallExpression {
	return {
		arguments: [],
		callee: { name, type: "Identifier" },
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
