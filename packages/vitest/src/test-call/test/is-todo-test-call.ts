import type { ESTree } from "@oxlint/plugins";

export function isTodoTestCall(callee: ESTree.Node): boolean {
	let current: ESTree.Node = callee;

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

		if (current.type === "MemberExpression" && !current.computed && current.property.type === "Identifier") {
			if (current.property.name === "todo") {
				return true;
			}

			current = current.object;
			continue;
		}

		break;
	}

	return false;
}
