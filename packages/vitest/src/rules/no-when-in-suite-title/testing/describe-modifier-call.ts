import type { ESTree } from "@oxlint/plugins";

export function describeModifierCall(modifier: "each" | "skip"): ESTree.CallExpression {
	return {
		arguments: [{ elements: [], type: "ArrayExpression" }],
		callee: {
			computed: false,
			object: { name: "describe", type: "Identifier" },
			optional: false,
			property: { name: modifier, type: "Identifier" },
			type: "MemberExpression"
		},
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
