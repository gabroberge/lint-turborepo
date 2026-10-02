import type { ESTree } from "@oxlint/plugins";

import { isViOrJestMethodCall } from "./is-vi-or-jest-method-call";

export function isSpyOnCall(node: ESTree.CallExpression): boolean {
	return isViOrJestMethodCall(node, "spyOn");
}
