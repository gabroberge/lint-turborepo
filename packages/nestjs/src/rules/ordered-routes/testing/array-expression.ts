import type { ESTree } from "@oxlint/plugins";

export function arrayExpression(elements: ESTree.ArrayExpression["elements"]): ESTree.ArrayExpression {
	return { elements, type: "ArrayExpression" } as unknown as ESTree.ArrayExpression;
}
