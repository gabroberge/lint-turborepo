import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export interface StaticTitle {
	literal: TitleLiteral;
	value: string;
}

export type TitleLiteral = ESTree.StringLiteral | ESTree.TemplateLiteral;

export function staticTitle(expression: ESTree.CallExpression["arguments"][number] | undefined): StaticTitle | null {
	if (expression === undefined || expression.type === "SpreadElement") {
		return null;
	}

	const unwrapped = unwrapExpression(expression);
	if (unwrapped.type === "Literal" && typeof unwrapped.value === "string") {
		return { literal: unwrapped, value: unwrapped.value };
	}

	const quasi = unwrapped.type === "TemplateLiteral" ? unwrapped.quasis[0] : undefined;
	if (
		unwrapped.type === "TemplateLiteral" &&
		unwrapped.expressions.length === 0 &&
		unwrapped.quasis.length === 1 &&
		quasi !== undefined &&
		quasi.value.cooked !== null
	) {
		return { literal: unwrapped, value: quasi.value.cooked };
	}

	return null;
}
