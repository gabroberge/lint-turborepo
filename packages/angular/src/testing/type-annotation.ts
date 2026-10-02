import type { ESTree } from "@oxlint/plugins";

export function typeAnnotation(name: string): ESTree.TSTypeAnnotation {
	return {
		type: "TSTypeAnnotation",
		typeAnnotation: {
			type: "TSTypeReference",
			typeName: { name, type: "Identifier" }
		}
	} as ESTree.TSTypeAnnotation;
}
