import type { Node, SyntaxKind } from "typescript";
import { canHaveModifiers, getModifiers } from "typescript";

export function hasModifier(node: Node, kind: SyntaxKind): boolean {
	if (!canHaveModifiers(node)) {
		return false;
	}

	const modifiers = getModifiers(node);
	if (!modifiers) {
		return false;
	}

	return modifiers.some((modifier) => modifier.kind === kind);
}
