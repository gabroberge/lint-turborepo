import type { ESTree } from "@oxlint/plugins";

export function array(...elements: (ESTree.Expression | ESTree.SpreadElement)[]): ESTree.ArrayExpression {
	return { elements, type: "ArrayExpression" } as unknown as ESTree.ArrayExpression;
}
