import type { ESTree } from "@oxlint/plugins";

export function template(
	cooked: string | null,
	raw: string,
	expressions: ESTree.Expression[] = []
): ESTree.TemplateLiteral {
	return {
		expressions,
		quasis: [
			{
				tail: true,
				type: "TemplateElement",
				value: { cooked, raw }
			}
		],
		type: "TemplateLiteral"
	} as ESTree.TemplateLiteral;
}
