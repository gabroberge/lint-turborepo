import { isCommentFragment } from "./is-comment-fragment";
import { isFullLineComment } from "./is-full-line-comment";

/**
 * Start of the comment lines attached to the statement, with no blank line
 * between them and the statement. A partial block comment is ambiguous.
 */
export function leadingCommentStart(source: string, lineStart: number): number | "ambiguous" | null {
	let scan = lineStart;
	let included = lineStart;

	while (scan > 0) {
		if (source[scan - 1] !== "\n") {
			return "ambiguous";
		}

		let previousEnd = scan - 1;
		if (previousEnd > 0 && source[previousEnd - 1] === "\r") {
			previousEnd--;
		}

		let previousStart = previousEnd;
		while (previousStart > 0 && source[previousStart - 1] !== "\n") {
			previousStart--;
		}

		const line = source.slice(previousStart, previousEnd);
		if (line.trim() === "") {
			break;
		}

		if (isFullLineComment(line)) {
			included = previousStart;
			scan = previousStart;
			continue;
		}

		if (isCommentFragment(line)) {
			return "ambiguous";
		}

		break;
	}

	if (included === lineStart) {
		return null;
	}

	return included;
}
