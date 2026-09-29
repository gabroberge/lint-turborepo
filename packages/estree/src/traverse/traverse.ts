import type { ESTree } from "@oxlint/plugins";

import { isNode } from "./is-node";

const skippedKeys = new Set(["end", "loc", "parent", "range", "start"]);

export function traverse(
	node: ESTree.Node,
	visit: (node: ESTree.Node) => "skip" | undefined,
	seen: WeakSet<object> = new WeakSet<object>()
): void {
	if (seen.has(node)) {
		return;
	}

	seen.add(node);
	if (visit(node) === "skip") {
		return;
	}

	for (const [key, value] of Object.entries(node)) {
		if (skippedKeys.has(key)) {
			continue;
		}

		const items = Array.isArray(value) ? value : [value];
		for (const item of items) {
			if (isNode(item)) {
				traverse(item, visit, seen);
			}
		}
	}
}
