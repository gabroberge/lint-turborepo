import type { ESTree } from "@oxlint/plugins";

export function member(object: string, property: string): ESTree.MemberExpression {
	return {
		computed: false,
		object: { name: object, type: "Identifier" },
		property: { name: property, type: "Identifier" },
		type: "MemberExpression"
	} as unknown as ESTree.MemberExpression;
}
