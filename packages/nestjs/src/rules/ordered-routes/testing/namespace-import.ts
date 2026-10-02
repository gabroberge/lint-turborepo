import type { ESTree } from "@oxlint/plugins";

export function namespaceImport(source: string, local: string): ESTree.ImportDeclaration {
	return {
		importKind: "value",
		source: { type: "Literal", value: source },
		specifiers: [
			{
				local: { name: local, type: "Identifier" },
				type: "ImportNamespaceSpecifier"
			}
		],
		type: "ImportDeclaration"
	} as unknown as ESTree.ImportDeclaration;
}
