import { unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

export type EqualityMatcher = "toBe" | "toEqual" | "toStrictEqual";

const EQUALITY_MATCHERS: ReadonlySet<string> = new Set(["toBe", "toEqual", "toStrictEqual"]);

/**
 * The equality matcher on this call, if it is a static `.toBe` / `.toEqual` /
 * `.toStrictEqual`. Computed access is ignored.
 */
export function equalityMatcherName(node: ESTree.CallExpression): EqualityMatcher | null {
	const callee = unwrapExpression(node.callee);
	if (callee.type !== "MemberExpression") {
		return null;
	}

	if (callee.computed) {
		return null;
	}

	if (callee.property.type !== "Identifier") {
		return null;
	}

	if (!EQUALITY_MATCHERS.has(callee.property.name)) {
		return null;
	}

	return callee.property.name as EqualityMatcher;
}
