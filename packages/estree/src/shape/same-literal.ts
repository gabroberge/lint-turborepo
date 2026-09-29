import type { ESTree } from "@oxlint/plugins";

type LiteralExpression = Extract<ESTree.Expression, { type: "Literal" }>;

export function sameLiteral(left: LiteralExpression, right: LiteralExpression): boolean {
	if ("bigint" in left && "bigint" in right) {
		return left.bigint === right.bigint;
	}

	if ("bigint" in left || "bigint" in right) {
		return false;
	}

	if (left.value instanceof RegExp && right.value instanceof RegExp) {
		return left.value.source === right.value.source && left.value.flags === right.value.flags;
	}

	if (left.value instanceof RegExp || right.value instanceof RegExp) {
		return false;
	}

	return left.value === right.value;
}
