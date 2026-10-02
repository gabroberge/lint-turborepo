import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export function matcherObject(node: ESTree.CallExpression, matchers: ReadonlySet<string>): ESTree.Expression | null {
	const callee = unwrapExpression(node.callee);
	if (callee.type !== "MemberExpression" || callee.computed || callee.property.type !== "Identifier") {
		return null;
	}

	if (!matchers.has(callee.property.name)) {
		return null;
	}

	return callee.object;
}
