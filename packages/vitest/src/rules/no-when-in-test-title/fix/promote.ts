import type { ESTree } from "@oxlint/plugins";

import { callbackCanMove } from "../promote/callback-can-move";
import { parameterLists } from "../promote/parameter-lists";
import { parseParameterizedTest } from "../promote/parse-parameterized-test";
import { renderInnerFunction } from "../render/inner-function";
import { statementBounds } from "../statement/bounds";
import { hasBehaviorSensitiveNewline } from "../statement/sensitive-newline";
import type { SplitTitle } from "../title/split-when";

/**
 * Move a condition-only parameterized title onto `describe.each` / `describe.for`
 * and keep the behavioral outcome on `it` / `test`.
 */
export function promoteParameterizedTest(
	source: string,
	testCall: ESTree.CallExpression,
	split: SplitTitle
): { range: [number, number]; text: string } | null {
	const bounds = statementBounds(source, testCall);
	if (bounds === null) {
		return null;
	}

	const parameterized = parseParameterizedTest(source, testCall);
	if (parameterized === null) {
		return null;
	}

	if (hasBehaviorSensitiveNewline(parameterized.callback, source, split.literal)) {
		return null;
	}

	if (!callbackCanMove(parameterized.callback, source, parameterized.factoryName)) {
		return null;
	}

	const lists = parameterLists(source, parameterized.callback, parameterized.factoryName);
	if (lists === null) {
		return null;
	}

	const itIndent = `${bounds.baseIndent}\t`;
	const bodyIndent = `${bounds.baseIndent}\t\t`;
	const innerFunction = renderInnerFunction(source, parameterized.callback, lists.innerParams, bodyIndent, itIndent);
	if (innerFunction === null) {
		return null;
	}

	const innerStatement = `${itIndent}${parameterized.testCallee}(${JSON.stringify(split.outcome)}, ${innerFunction}${parameterized.extraSource});`;

	return {
		range: bounds.range,
		text: `${parameterized.describeCallee}(${JSON.stringify(split.describeTitle)}, ${lists.describeParams} => {\n${innerStatement}\n${bounds.baseIndent}});`
	};
}
