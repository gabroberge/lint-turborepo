/**
 * A line that is only a line comment or a single-line block comment.
 */
export function isFullLineComment(line: string): boolean {
	return /^[ \t]*\/\/.*$/u.test(line) || /^[ \t]*\/\*.*\*\/[ \t]*$/u.test(line);
}
