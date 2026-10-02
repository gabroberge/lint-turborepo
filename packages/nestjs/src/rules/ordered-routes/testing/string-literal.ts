import type { ESTree } from "@oxlint/plugins";

export function stringLiteral(value: string): ESTree.StringLiteral {
	return { type: "Literal", value } as unknown as ESTree.StringLiteral;
}
