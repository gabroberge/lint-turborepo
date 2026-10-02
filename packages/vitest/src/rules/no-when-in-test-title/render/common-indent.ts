/**
 * The longest shared leading spaces-or-tabs prefix of the non-empty lines.
 */
export function commonIndent(lines: string[]): string {
	const nonEmpty = lines.filter((line) => line.trim() !== "");
	const first = nonEmpty[0] ?? "";
	let prefix = /^[ \t]*/.exec(first)?.[0] ?? "";

	for (const line of nonEmpty) {
		const whitespace = /^[ \t]*/.exec(line)?.[0] ?? "";
		const length = Math.min(prefix.length, whitespace.length);

		let index = 0;
		while (index < length && prefix[index] === whitespace[index]) {
			index++;
		}

		prefix = prefix.slice(0, index);
	}

	return prefix;
}
