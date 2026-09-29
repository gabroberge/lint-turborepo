import type { ESTree } from "@oxlint/plugins";

export function identifierName(node: ESTree.Node): string | null {
	if (node.type === "Identifier") {
		return node.name;
	}

	return null;
}
