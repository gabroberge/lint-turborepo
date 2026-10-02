import type { ESTree } from "@oxlint/plugins";

export function arraySpread(argument: ESTree.Expression): ESTree.ArrayExpression {
	return {
		elements: [{ argument, type: "SpreadElement" }],
		type: "ArrayExpression"
	} as ESTree.ArrayExpression;
}
