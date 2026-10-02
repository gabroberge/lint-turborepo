import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * True for `beforeEach(...)`. `beforeAll`, `afterEach`, and a member form
 * such as `beforeEach.skip` are not `beforeEach`.
 */
export function isBeforeEachCall(node: ESTree.CallExpression): boolean {
	const callee = unwrapExpression(node.callee);
	return callee.type === "Identifier" && callee.name === "beforeEach";
}
