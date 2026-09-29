import type { ESTree } from "@oxlint/plugins";

export function typeReferenceName(node: ESTree.Node): string | null {
	let current = node;
	while (current.type === "TSParenthesizedType") {
		current = current.typeAnnotation;
	}

	if (current.type !== "TSTypeReference" || current.typeName.type !== "Identifier") {
		return null;
	}

	return current.typeName.name;
}
