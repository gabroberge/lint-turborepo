import type { ESTree } from "@oxlint/plugins";

export function memberCall(object: string, property: string, args: object[]): ESTree.CallExpression {
	return {
		arguments: args,
		callee: {
			computed: false,
			object: { name: object, type: "Identifier" },
			optional: false,
			property: { name: property, type: "Identifier" },
			type: "MemberExpression"
		},
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
