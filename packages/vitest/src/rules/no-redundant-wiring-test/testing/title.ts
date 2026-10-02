import type { ESTree } from "@oxlint/plugins";

export function title(value: string): ESTree.StringLiteral {
	return { type: "Literal", value } as ESTree.StringLiteral;
}
