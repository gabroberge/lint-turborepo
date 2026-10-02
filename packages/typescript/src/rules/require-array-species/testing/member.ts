import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function member(object: string, property: string): ESTree.MemberExpression {
	return {
		computed: false,
		object: identifier(object),
		optional: false,
		property: identifier(property),
		type: "MemberExpression"
	} as unknown as ESTree.MemberExpression;
}
