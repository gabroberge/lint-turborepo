import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * True when the callee is the identifier `expect` after transparent wrappers.
 * Does not walk member chains; `foo.expect` is not a root.
 */
export function isExpectRoot(callee: ESTree.Expression): boolean {
	const root = unwrapExpression(callee);
	return root.type === "Identifier" && root.name === "expect";
}
