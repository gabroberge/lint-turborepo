import type { ESTree } from "@oxlint/plugins";

export function numeric(value: number): ESTree.NumericLiteral {
	return { type: "Literal", value } as unknown as ESTree.NumericLiteral;
}
