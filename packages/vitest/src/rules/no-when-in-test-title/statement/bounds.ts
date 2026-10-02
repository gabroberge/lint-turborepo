import type { ESTree } from "@oxlint/plugins";

import { restOfLineIsCommentOrEmpty } from "./rest-of-line";

export interface StatementBounds {
	baseIndent: string;
	range: [number, number];
}

/**
 * The replaceable statement that is exactly this test call: leading indent
 * of the call's line, through an optional semicolon. Refuses a call that
 * shares its line with other code.
 */
export function statementBounds(source: string, testCall: ESTree.CallExpression): StatementBounds | null {
	const start = testCall.range[0];

	let lineStart = start;
	while (lineStart > 0 && source[lineStart - 1] !== "\n") {
		lineStart--;
	}

	const baseIndent = source.slice(lineStart, start);
	if (baseIndent.trim() !== "") {
		return null;
	}

	let end = testCall.range[1];
	while (source[end] === " " || source[end] === "\t") {
		end++;
	}

	if (source[end] === ";") {
		end++;
	}

	if (!restOfLineIsCommentOrEmpty(source, end)) {
		return null;
	}

	return { baseIndent, range: [start, end] };
}
