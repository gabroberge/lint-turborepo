/** Whether `from` and `to` are on the same line: no line break lies between them. */
export function sameLine(source: string, from: number, to: number): boolean {
	return !source.slice(from, to).includes("\n");
}
