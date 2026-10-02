import type { ESTree } from "@oxlint/plugins";

import { factoryMember } from "./factory-member";

export interface FactoryCall {
	factoryName: "each" | "for";
	factorySource: string;
	rest: ESTree.Expression;
}

/**
 * The `.each` / `.for` factory at the start of a test callee: a tagged
 * template or a call. Optional chaining is not an equivalent factory.
 */
export function factoryFromCallee(source: string, callee: ESTree.Node): FactoryCall | null {
	if (callee.type === "ChainExpression") {
		return null;
	}

	if (callee.type === "TaggedTemplateExpression") {
		const member = factoryMember(callee.tag);
		if (member === null) {
			return null;
		}

		return {
			factoryName: member.name,
			factorySource: `.${member.name}${source.slice(member.rangeEnd, callee.quasi.range[1])}`,
			rest: member.object
		};
	}

	if (callee.type === "CallExpression") {
		if (callee.optional) {
			return null;
		}

		const member = factoryMember(callee.callee);
		if (member === null) {
			return null;
		}

		return {
			factoryName: member.name,
			factorySource: `.${member.name}${source.slice(member.rangeEnd, callee.range[1])}`,
			rest: member.object
		};
	}

	return null;
}
