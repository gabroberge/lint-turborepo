import { isNode } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

import type { Walker } from "./walker";

/**
 * Keys that never hold runtime code worth following. Decorators are code,
 * but they only appear on module classes (walked as their definition code),
 * nested classes (unanalyzed) and their members and parameters.
 */
const SKIPPED_KEYS = new Set([
	"decorators",
	"end",
	"label",
	"loc",
	"parent",
	"range",
	"returnType",
	"start",
	"type",
	"typeAnnotation",
	"typeArguments",
	"typeParameters"
]);

/** A node without a dedicated handler: every runtime child is evaluated for its effects. */
export function visitChildren(walker: Walker, node: ESTree.Node): void {
	for (const [key, value] of Object.entries(node)) {
		if (SKIPPED_KEYS.has(key)) {
			continue;
		}

		const items: unknown[] = Array.isArray(value) ? value : [value];
		for (const item of items) {
			if (isNode(item)) {
				walker.visit(item, "run");
			}
		}
	}
}
