import type { ESTree } from "@oxlint/plugins";

export function identifier(name: string): ESTree.IdentifierReference {
	return { name, type: "Identifier" } as ESTree.IdentifierReference;
}
