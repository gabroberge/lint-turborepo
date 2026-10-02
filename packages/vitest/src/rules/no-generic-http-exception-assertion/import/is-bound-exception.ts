import type { ESTree } from "@oxlint/plugins";

import type { Binding } from "./collect-import";

export function isBoundException(expression: ESTree.Node, bindings: Map<string, Binding>): boolean {
	if (expression.type === "Identifier") {
		return bindings.get(expression.name)?.type === "exception";
	}

	if (
		expression.type !== "MemberExpression" ||
		expression.computed ||
		expression.object.type !== "Identifier" ||
		expression.property.type !== "Identifier"
	) {
		return false;
	}

	const namespace = bindings.get(expression.object.name);
	return namespace?.type === "namespace" && namespace.exceptionNames.has(expression.property.name);
}
