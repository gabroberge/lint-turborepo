import type { ESTree } from "@oxlint/plugins";

import { TEST_MODIFIERS } from "./test-modifiers";

export function unwrapCallee(callee: ESTree.Node): ESTree.Node {
	let current = callee;

	for (;;) {
		if (current.type === "ChainExpression") {
			current = current.expression;
			continue;
		}

		if (current.type === "CallExpression") {
			current = current.callee;
			continue;
		}

		if (current.type === "TaggedTemplateExpression") {
			current = current.tag;
			continue;
		}

		if (
			current.type === "MemberExpression" &&
			!current.computed &&
			current.property.type === "Identifier" &&
			TEST_MODIFIERS.has(current.property.name)
		) {
			current = current.object;
			continue;
		}

		return current;
	}
}
