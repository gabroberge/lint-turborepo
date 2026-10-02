import { isFunctionNode, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/** True when an expression is a function literal, ignoring parentheses and type assertions. */
export function isFunctionLiteral(node: ESTree.Node | null): boolean {
	return node !== null && isFunctionNode(unwrapExpression(node));
}
