export function blankSeparator(source: string, from: number, to: number): string | null {
	const separator = source.slice(from, to);
	if (separator.trim() !== "") {
		return null;
	}

	return separator;
}
