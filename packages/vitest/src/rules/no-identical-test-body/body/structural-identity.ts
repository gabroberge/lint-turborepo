import type { ESTree } from "@oxlint/plugins";

import { authoredTree } from "./authored-tree";

/**
 * Lookup key for an authored AST: `JSON.stringify` of the authored tree.
 */
export function structuralIdentity(node: ESTree.Node): string {
	return JSON.stringify(authoredTree(node));
}
