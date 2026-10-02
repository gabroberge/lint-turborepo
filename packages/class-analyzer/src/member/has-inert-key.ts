import type { ESTree } from "@oxlint/plugins";

/**
 * True for a non-computed key, or a computed literal, identifier,
 * non-computed member chain or expression-free template. Computed keys are
 * evaluated in source order while the class is defined, so a key outside
 * those shapes could run code that moving its member would reorder. Getters
 * and key conversions are assumed to run no code, and an inert key may still
 * read a binding that a non-inert key changes: treat keys as movable only
 * when every key in the class is inert.
 */
export function hasInertKey(node: ESTree.ClassElement): boolean {
	if (node.type === "StaticBlock" || node.type === "TSIndexSignature" || !node.computed) {
		return true;
	}

	return isInert(node.key);
}

function isInert(node: ESTree.Node): boolean {
	if (node.type === "Identifier" || node.type === "Literal") {
		return true;
	}

	if (node.type === "MemberExpression") {
		return !node.computed && isInert(node.object);
	}

	return node.type === "TemplateLiteral" && node.expressions.length === 0;
}
