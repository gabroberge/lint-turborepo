import type { ESTree } from "@oxlint/plugins";

/**
 * End of the statement, including a trailing semicolon and a same-line
 * comment. Returns -1 when a trailing block comment spans more than one line.
 */
export function statementEnd(source: string, statement: ESTree.Statement): number {
	let end = statement.range[1];
	if (source[end] === ";") {
		end++;
	}

	while (source[end] === " " || source[end] === "\t") {
		end++;
	}

	if (source.startsWith("//", end)) {
		while (end < source.length && source[end] !== "\n" && source[end] !== "\r") {
			end++;
		}
		return end;
	}

	if (!source.startsWith("/*", end)) {
		return end;
	}

	const close = source.indexOf("*/", end + 2);
	if (close < 0 || source.slice(end, close).includes("\n")) {
		return -1;
	}

	end = close + 2;
	while (source[end] === " " || source[end] === "\t") {
		end++;
	}

	return end;
}
