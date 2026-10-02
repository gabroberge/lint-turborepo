import type { ESTree } from "@oxlint/plugins";

export function objectSpread(argument: ESTree.Expression): ESTree.ObjectExpression {
	return {
		properties: [{ argument, type: "SpreadElement" }],
		type: "ObjectExpression"
	} as ESTree.ObjectExpression;
}
