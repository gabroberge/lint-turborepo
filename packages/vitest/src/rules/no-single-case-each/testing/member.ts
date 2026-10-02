import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function member(object: ESTree.Expression, property: string, computed = false): ESTree.MemberExpression {
	return {
		computed,
		object,
		optional: false,
		property: computed ? ({ type: "Literal", value: property } as ESTree.StringLiteral) : identifier(property),
		type: "MemberExpression"
	} as unknown as ESTree.MemberExpression;
}
