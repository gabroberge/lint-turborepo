import type { ESTree } from "@oxlint/plugins";

import { identifier } from "./identifier";

export function objectSpreadPlus(argument: ESTree.Expression): ESTree.ObjectExpression {
	return {
		properties: [
			{ argument, type: "SpreadElement" },
			{
				computed: false,
				key: identifier("status"),
				kind: "init",
				method: false,
				shorthand: false,
				type: "Property",
				value: { raw: '"active"', type: "Literal", value: "active" }
			}
		],
		type: "ObjectExpression"
	} as ESTree.ObjectExpression;
}
