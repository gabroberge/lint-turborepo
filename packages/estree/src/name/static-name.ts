import type { ESTree } from "@oxlint/plugins";

export function staticName(node: ESTree.Node): string | null {
	if (node.type === "Identifier" || node.type === "PrivateIdentifier") {
		return node.name;
	}

	return null;
}
