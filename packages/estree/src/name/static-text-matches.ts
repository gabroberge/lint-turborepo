import type { ESTree } from "@oxlint/plugins";

export function staticTextMatches(expression: ESTree.Expression, pattern: RegExp): boolean {
	if (expression.type === "Literal" && typeof expression.value === "string") {
		return pattern.test(expression.value);
	}

	if (expression.type === "TemplateLiteral") {
		return expression.quasis.some((quasi) => {
			const cooked = quasi.value.cooked;
			return cooked !== null && pattern.test(cooked);
		});
	}

	return false;
}
