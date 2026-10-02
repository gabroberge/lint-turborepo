import type { ESTree } from "@oxlint/plugins";

export function identifier(name: string, extra: Record<string, unknown> = {}): ESTree.IdentifierReference {
	return { name, type: "Identifier", ...extra } as unknown as ESTree.IdentifierReference;
}
