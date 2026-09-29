import type { Node } from "typescript";
import { SyntaxKind } from "typescript";

import { hasModifier } from "./has-modifier";

export function isExported(node: Node): boolean {
	return hasModifier(node, SyntaxKind.ExportKeyword);
}
