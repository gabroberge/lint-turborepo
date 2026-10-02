import type { ESTree } from "@oxlint/plugins";

const WHEN_PREFIX = /^when\b/iu;

/**
 * True when the expression's static text starts with the word `when`.
 * `whenever` and `whenfoo` are not the word `when`. A `when` that is not the
 * first word is ignored.
 *
 * A template is judged by its leading cooked text. Later interpolations are
 * not evaluated.
 */
export function startsWithWhen(expression: ESTree.Expression): boolean {
	if (expression.type === "Literal" && typeof expression.value === "string") {
		return WHEN_PREFIX.test(expression.value.trim());
	}

	if (expression.type === "TemplateLiteral") {
		const cooked = expression.quasis[0]?.value.cooked;
		if (cooked === null || cooked === undefined) {
			return false;
		}

		return WHEN_PREFIX.test(cooked.trimStart());
	}

	return false;
}
