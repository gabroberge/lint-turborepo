import type { ESTree } from "@oxlint/plugins";

export function parenthesizedTypeAnnotation(name: string): ESTree.TSTypeAnnotation {
	return {
		type: "TSTypeAnnotation",
		typeAnnotation: {
			type: "TSParenthesizedType",
			typeAnnotation: {
				type: "TSTypeReference",
				typeName: { name, type: "Identifier" }
			}
		}
	} as ESTree.TSTypeAnnotation;
}
