import { staticTextMatches, unwrapExpression } from "@gabroberge/oxlint-estree";
import type { ESTree } from "@oxlint/plugins";

const IF_WORD = /\bif\b/iu;

/**
 * True when static title text contains the word `if` at a word boundary, at
 * any capitalization. `diff`, `verify`, and `iff` do not match. Only string
 * literals and cooked template segments are read.
 */
export function titleContainsIf(title: ESTree.Expression): boolean {
	return staticTextMatches(unwrapExpression(title), IF_WORD);
}
