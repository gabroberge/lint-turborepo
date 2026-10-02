import type { ESTree } from "@oxlint/plugins";

export function identifier(name: string): ESTree.IdentifierName & ESTree.IdentifierReference {
	return { name, type: "Identifier" } as unknown as ESTree.IdentifierName & ESTree.IdentifierReference;
}
