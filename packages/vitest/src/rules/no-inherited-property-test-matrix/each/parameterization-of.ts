import type { ESTree } from "@oxlint/plugins";

import { expressionArgument } from "./expression-argument";

export interface Parameterization {
	modifier: "each" | "for";
	table: ESTree.Expression | null;
}

export function parameterizationOf(node: ESTree.CallExpression): Parameterization | null {
	let modifier: "each" | "for" | null = null;
	let table: ESTree.Expression | null = null;
	let current: ESTree.Node = node.callee;

	for (;;) {
		if (current.type === "ChainExpression") {
			current = current.expression;
			continue;
		}

		if (current.type === "CallExpression") {
			const callee: ESTree.Node = current.callee;

			if (
				callee.type === "MemberExpression" &&
				!callee.computed &&
				callee.property.type === "Identifier" &&
				(callee.property.name === "each" || callee.property.name === "for")
			) {
				modifier = callee.property.name;
				table = expressionArgument(current.arguments[0]);
			}

			current = callee;
			continue;
		}

		if (current.type === "TaggedTemplateExpression") {
			modifier ??= "each";
			table = null;
			current = current.tag;
			continue;
		}

		if (current.type === "MemberExpression" && !current.computed && current.property.type === "Identifier") {
			current = current.object;
			continue;
		}

		break;
	}

	if (modifier === null) {
		return null;
	}

	return { modifier, table };
}
