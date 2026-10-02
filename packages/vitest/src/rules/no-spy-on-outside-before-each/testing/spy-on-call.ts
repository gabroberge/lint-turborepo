import type { ESTree } from "@oxlint/plugins";

interface SpyOnFlags {
	computed?: boolean;
	optional?: boolean;
}

export function spyOnCall(object: string, property: string, flags: SpyOnFlags = {}): ESTree.CallExpression {
	return {
		arguments: [],
		callee: {
			computed: flags.computed ?? false,
			object: { name: object, type: "Identifier" },
			optional: flags.optional ?? false,
			property: { name: property, type: "Identifier" },
			type: "MemberExpression"
		},
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
