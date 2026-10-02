import type { ESTree } from "@oxlint/plugins";

export function specifier(exported: string, local: string): ESTree.ImportSpecifier {
	return {
		imported: { name: exported, type: "Identifier" },
		importKind: "value",
		local: { name: local, type: "Identifier" },
		type: "ImportSpecifier"
	} as unknown as ESTree.ImportSpecifier;
}
