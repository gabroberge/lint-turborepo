import type { ESTree } from "@oxlint/plugins";

export interface FactoryMember {
	name: "each" | "for";
	object: ESTree.Expression;
	rangeEnd: number;
}

/**
 * A non-computed `.each` / `.for` member. Optional and computed access are
 * not an equivalent factory.
 */
export function factoryMember(node: ESTree.Node): FactoryMember | null {
	if (
		node.type !== "MemberExpression" ||
		node.computed ||
		node.optional ||
		node.property.type !== "Identifier" ||
		(node.property.name !== "each" && node.property.name !== "for")
	) {
		return null;
	}

	return {
		name: node.property.name,
		object: node.object,
		rangeEnd: node.range[1]
	};
}
