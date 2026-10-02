/**
 * The index just before a trailing LF or CRLF at `end`.
 */
export function withoutTrailingNewline(source: string, end: number): number {
	if (end > 0 && source[end - 1] === "\n") {
		end--;
		if (end > 0 && source[end - 1] === "\r") {
			end--;
		}
	}

	return end;
}
