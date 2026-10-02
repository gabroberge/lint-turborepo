import type { ESTree } from "@oxlint/plugins";

export function templateTitle(cooked: string, expressions: ESTree.Expression[] = []): ESTree.TemplateLiteral {
	return {
		expressions,
		quasis: [
			{
				tail: expressions.length === 0,
				type: "TemplateElement",
				value: { cooked, raw: cooked }
			}
		],
		type: "TemplateLiteral"
	} as ESTree.TemplateLiteral;
}
