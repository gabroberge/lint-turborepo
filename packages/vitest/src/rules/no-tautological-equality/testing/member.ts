import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function member(object: string, property: string): ESTree.MemberExpression {
	return {
		computed: false,
		object: identifier(object),
		property: identifier(property),
		type: "MemberExpression"
	} as ESTree.MemberExpression;
}
