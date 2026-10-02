import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function factoryCall(modifier: "each" | "for"): ESTree.CallExpression {
	return {
		arguments: [{ elements: [], type: "ArrayExpression" }],
		callee: {
			computed: false,
			object: identifier("it"),
			optional: false,
			property: identifier(modifier),
			type: "MemberExpression"
		},
		optional: false,
		type: "CallExpression"
	} as unknown as ESTree.CallExpression;
}
