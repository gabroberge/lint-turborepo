import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function member(object: object, property: string): ESTree.MemberExpression {
	return {
		computed: false,
		object,
		optional: false,
		property: identifier(property),
		type: "MemberExpression"
	} as unknown as ESTree.MemberExpression;
}
