import { areIdenticalSafeExpressions } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

/**
 * True when actual and expected name the same side-effect-free value.
 */
export function isIdenticalExpected(actual: ESTree.Expression, expected: ESTree.Expression): boolean {
	return areIdenticalSafeExpressions(actual, expected);
}
