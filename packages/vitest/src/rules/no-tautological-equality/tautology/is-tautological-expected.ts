import type { ESTree } from "@oxlint/plugins";

import { isIdenticalExpected } from "./is-identical-expected";
import { isSoleSpreadOfActual } from "./is-sole-spread-of-actual";

/**
 * True when `expected` cannot disagree with `actual`.
 *
 * Two shapes: the expressions are the same side-effect-free value, or
 * `expected` is a sole object/array spread of that same copyable reference.
 * `toBe` is reference equality, so a sole spread (a new object) is not
 * tautological for that matcher.
 */
export function isTautologicalExpected(
	matcher: string,
	actual: ESTree.Expression,
	expected: ESTree.Expression
): boolean {
	if (isIdenticalExpected(actual, expected)) {
		return true;
	}

	if (matcher === "toBe") {
		return false;
	}

	return isSoleSpreadOfActual(actual, expected);
}
