import type { ESTree } from "@oxlint/plugins";

import { statementBounds } from "../statement/bounds";
import { indentStatement } from "../statement/indent";
import { hasBehaviorSensitiveNewline } from "../statement/sensitive-newline";
import type { SplitTitle } from "../title/split-when";

/**
 * Wrap the test in `describe("<when> <condition>", …)` and keep the call
 * as the behavioral outcome.
 */
export function wrapTest(
	source: string,
	testCall: ESTree.CallExpression,
	split: SplitTitle
): { range: [number, number]; text: string } | null {
	const bounds = statementBounds(source, testCall);
	if (bounds === null) {
		return null;
	}

	if (hasBehaviorSensitiveNewline(testCall, source, split.literal)) {
		return null;
	}

	const start = testCall.range[0];
	const testText = source.slice(start, testCall.range[1]);
	const renamed =
		testText.slice(0, split.literal.range[0] - start) +
		JSON.stringify(split.outcome) +
		testText.slice(split.literal.range[1] - start);

	const statement = renamed.endsWith(";") ? renamed : `${renamed};`;

	return {
		range: bounds.range,
		text: `describe(${JSON.stringify(split.describeTitle)}, () => {\n${indentStatement(statement, bounds.baseIndent)}\n${bounds.baseIndent}});`
	};
}
