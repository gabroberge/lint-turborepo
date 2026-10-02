/** The offset of the first character on the line holding `index`. */
export function lineStart(source: string, index: number): number {
	return source.lastIndexOf("\n", index - 1) + 1;
}
