import type { ESTree } from "@oxlint/plugins";

export function identifier(name: string): ESTree.IdentifierName {
	return { name, type: "Identifier" } as ESTree.IdentifierName;
}
