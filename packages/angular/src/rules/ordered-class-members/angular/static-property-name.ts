import type { ESTree } from "@oxlint/plugins";

/** The property name of a non-computed `object.name` access, or `null` for a computed or private one. */
export function staticPropertyName(node: ESTree.MemberExpression): string | null {
	if (node.computed || node.property.type !== "Identifier") {
		return null;
	}

	return node.property.name;
}
