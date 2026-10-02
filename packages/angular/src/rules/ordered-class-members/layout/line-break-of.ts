/** The line break `source` uses, judged by its first one: `\r\n` or `\n`. */
export function lineBreakOf(source: string): string {
	const index = source.indexOf("\n");

	return index > 0 && source[index - 1] === "\r" ? "\r\n" : "\n";
}
