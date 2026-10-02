/**
 * The remainder of the line at `offset` is only whitespace, a trailing
 * comment, or empty. Anything else means the call is not the whole statement.
 */
export function restOfLineIsCommentOrEmpty(source: string, offset: number): boolean {
	let cursor = offset;
	while (cursor < source.length && source[cursor] !== "\n") {
		const current = source[cursor];
		if (current === " " || current === "\t" || current === "\r") {
			cursor++;
			continue;
		}

		if (current === "/" && source[cursor + 1] === "/") {
			return true;
		}

		if (current === "/" && source[cursor + 1] === "*") {
			const close = source.indexOf("*/", cursor + 2);
			if (close === -1) {
				return false;
			}

			const lineEnd = source.indexOf("\n", close + 2);
			if (lineEnd === -1) {
				return source.slice(close + 2).trim() === "";
			}

			return source.slice(close + 2, lineEnd).trim() === "";
		}

		return false;
	}
	return true;
}
