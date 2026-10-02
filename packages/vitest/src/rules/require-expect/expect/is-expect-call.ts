import type { ESTree } from "@oxlint/plugins";

import { rootCallee } from "./root-callee";

/**
 * True for a call whose root callee identifier is `expect`
 * (`expect(...)`, `expect.assertions(...)`, `expect(...).toBe(...)`, etc.).
 * Does not match `notExpect` or `foo.expect`.
 */
export function isExpectCall(node: ESTree.CallExpression): boolean {
	const root = rootCallee(node.callee);
	return root.type === "Identifier" && root.name === "expect";
}
