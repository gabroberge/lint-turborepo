import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function pathArrayArgument(decorator: ESTree.Decorator): ESTree.ArrayExpression | null {
	const expression = unwrapExpression(decorator.expression);
	if (expression.type !== "CallExpression") {
		return null;
	}

	const first = expression.arguments[0];
	if (first === undefined || first.type === "SpreadElement") {
		return null;
	}

	const array = unwrapExpression(first);
	if (array.type !== "ArrayExpression") {
		return null;
	}

	return array;
}
