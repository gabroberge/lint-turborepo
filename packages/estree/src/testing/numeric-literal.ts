import type { ESTree } from "@oxlint/plugins";

export function numericLiteral(value: number): ESTree.NumericLiteral {
	return { type: "Literal", value } as ESTree.NumericLiteral;
}
