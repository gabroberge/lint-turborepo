import type { ESTree } from "@oxlint/plugins";

export function importDeclaration(
	source: string,
	specifiers: ESTree.ImportDeclaration["specifiers"],
	importKind: ESTree.ImportDeclaration["importKind"] = "value"
): ESTree.ImportDeclaration {
	return {
		importKind,
		source: { type: "Literal", value: source },
		specifiers,
		type: "ImportDeclaration"
	} as unknown as ESTree.ImportDeclaration;
}
