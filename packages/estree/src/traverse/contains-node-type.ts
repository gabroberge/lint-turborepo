import type { ESTree } from "@oxlint/plugins";

import { isNode } from "./is-node";

const skippedKeys = new Set(["loc", "parent", "range"]);

export function containsNodeType(node: ESTree.Node, type: string): boolean {
	function contains(current: ESTree.Node): boolean {
		if (seen.has(current)) {
			return false;
		}

		seen.add(current);
		if (current.type === type) {
			return true;
		}

		for (const [key, value] of Object.entries(current)) {
			if (skippedKeys.has(key)) {
				continue;
			}

			const items = Array.isArray(value) ? value : [value];
			for (const item of items) {
				if (isNode(item) && contains(item)) {
					return true;
				}
			}
		}

		return false;
	}

	const seen = new Set<ESTree.Node>();
	return contains(node);
}
