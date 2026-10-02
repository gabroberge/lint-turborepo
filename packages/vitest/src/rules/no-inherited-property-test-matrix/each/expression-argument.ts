import type { ESTree } from "@oxlint/plugins";

export function expressionArgument(
	argument: ESTree.CallExpression["arguments"][number] | undefined
): ESTree.Expression | null {
	if (argument === undefined || argument.type === "SpreadElement") {
		return null;
	}

	return argument;
}
