import { identifierName, unwrapAwaitedExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { isViOrJestIdentifier } from "./is-vi-or-jest-identifier";

export function isViOrJestMethodCall(node: ESTree.CallExpression, method: "fn" | "spyOn"): boolean {
	const callee = unwrapAwaitedExpression(node.callee);
	return (
		callee.type === "MemberExpression" &&
		!callee.computed &&
		isViOrJestIdentifier(callee.object) &&
		identifierName(callee.property) === method
	);
}
