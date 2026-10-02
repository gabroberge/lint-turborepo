import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * True for `vi.spyOn(...)`. Not `jest.spyOn`, a renamed `vi`, `vi["spyOn"]`,
 * or `vi?.spyOn`.
 */
export function isViSpyOn(node: ESTree.CallExpression): boolean {
	const callee = unwrapExpression(node.callee);
	return (
		callee.type === "MemberExpression" &&
		!callee.computed &&
		!callee.optional &&
		callee.object.type === "Identifier" &&
		callee.object.name === "vi" &&
		callee.property.type === "Identifier" &&
		callee.property.name === "spyOn"
	);
}
