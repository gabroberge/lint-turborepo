import type { ESTree } from "@oxlint/plugins";

import { classifyPlaceholders } from "../placeholder/classify";
import { splitTestTitle } from "../title/split-test-title";
import { promoteParameterizedTest } from "./promote";
import { wrapTest } from "./wrap";

export interface Replacement {
	range: [number, number];
	text: string;
}

/**
 * Chooses the safe rewrite for a `when` in a test title, or `null` when no
 * fix can be applied. Owns placeholder policy, reuse of an enclosing
 * describe, promotion, and wrapping.
 */
export function selectFix(
	source: string,
	testCall: ESTree.CallExpression,
	title: ESTree.Expression,
	enclosingTitle: string | null
): Replacement | null {
	const split = splitTestTitle(title);
	if (split === null) {
		return null;
	}

	const path = classifyPlaceholders(split.condition, split.outcome);
	if (path === "promote") {
		return promoteParameterizedTest(source, testCall, split);
	}

	if (path === null) {
		return null;
	}

	if (enclosingTitle === split.describeTitle) {
		return { range: split.literal.range, text: JSON.stringify(split.outcome) };
	}

	return wrapTest(source, testCall, split);
}
