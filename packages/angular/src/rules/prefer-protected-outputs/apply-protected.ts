import { startOf } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import { rewriteAccessibility } from "./rewrite-accessibility";

export interface RangeFixer<Fix> {
	replaceTextRange: (range: [number, number], text: string) => Fix;
}

export function applyProtected<Fix>(fixer: RangeFixer<Fix>, source: string, node: ESTree.PropertyDefinition): Fix {
	const keyStart = startOf(node.key);
	const lineStart = source.lastIndexOf("\n", keyStart - 1) + 1;
	const from = Math.max(lineStart, startOf(node));
	return fixer.replaceTextRange([from, keyStart], rewriteAccessibility(source.slice(from, keyStart)));
}
