/** The non-blank lines of `code`, trimmed and sorted: a fix that only permutes members keeps it unchanged. */
export function lineMultiset(code: string): string[] {
	return code
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line !== "")
		.toSorted((left, right) => left.localeCompare(right));
}
