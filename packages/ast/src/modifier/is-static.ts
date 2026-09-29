import type { Node } from "typescript";
import { SyntaxKind } from "typescript";

import { hasModifier } from "./has-modifier";

export function isStatic(node: Node): boolean {
	return hasModifier(node, SyntaxKind.StaticKeyword);
}
