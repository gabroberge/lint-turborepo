import type { ESTree } from "@oxlint/plugins";

type TransparentExpression =
	| ESTree.ChainExpression
	| ESTree.ParenthesizedExpression
	| ESTree.TSAsExpression
	| ESTree.TSNonNullExpression
	| ESTree.TSSatisfiesExpression
	| ESTree.TSTypeAssertion;

const transparentTypes = new Set([
	"ChainExpression",
	"ParenthesizedExpression",
	"TSAsExpression",
	"TSNonNullExpression",
	"TSSatisfiesExpression",
	"TSTypeAssertion"
]);

export function isTransparent(node: ESTree.Node): node is TransparentExpression {
	return transparentTypes.has(node.type);
}
