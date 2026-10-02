import type { ESTree } from "@oxlint/plugins";

import { leadingCommentStart } from "./leading-comment-start";

/**
 * Range of the test statement, including its indent, semicolon, and terminating
 * newline, plus comment lines that sit directly above it. Returns null when
 * another token shares the statement's lines or a comment there is ambiguous.
 */
export function removalRange(source: string, statement: ESTree.ExpressionStatement | null): [number, number] | null {
	if (statement === null) {
		return null;
	}
	const start = statement.range[0];

	let lineStart = start;
	while (lineStart > 0 && source[lineStart - 1] !== "\n") {
		lineStart--;
	}

	if (source.slice(lineStart, start).trim() !== "") {
		return null;
	}

	let end = statement.range[1];
	if (source[end] === ";") {
		end++;
	}

	while (source[end] === " " || source[end] === "\t") {
		end++;
	}

	if (source.startsWith("//", end) || source.startsWith("/*", end)) {
		return null;
	}

	if (end < source.length && source[end] !== "\n" && source[end] !== "\r") {
		return null;
	}

	if (source[end] === "\r") {
		end++;
	}

	if (source[end] === "\n") {
		end++;
	}

	const leading = leadingCommentStart(source, lineStart);
	if (leading === "ambiguous") {
		return null;
	}

	return [leading ?? lineStart, end];
}
