import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function computedMember(object: string, property: string): ESTree.MemberExpression {
	return {
		computed: true,
		object: identifier(object),
		optional: false,
		property: identifier(property),
		type: "MemberExpression"
	} as unknown as ESTree.MemberExpression;
}
