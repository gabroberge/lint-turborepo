import type { ESTree } from "@oxlint/plugins";

export function member(object: string, property: string): ESTree.StaticMemberExpression {
	return {
		computed: false,
		object: { name: object, type: "Identifier" },
		optional: false,
		property: { name: property, type: "Identifier" },
		type: "MemberExpression"
	} as unknown as ESTree.StaticMemberExpression;
}
