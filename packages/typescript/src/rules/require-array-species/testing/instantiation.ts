import type { ESTree } from "@oxlint/plugins";

export function instantiation(expression: ESTree.Expression): ESTree.TSInstantiationExpression {
	return {
		expression,
		type: "TSInstantiationExpression",
		typeArguments: { params: [], type: "TSTypeParameterInstantiation" }
	} as unknown as ESTree.TSInstantiationExpression;
}
