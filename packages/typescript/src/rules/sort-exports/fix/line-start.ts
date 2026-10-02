export function lineStart(source: string, index: number): number {
	let start = index;

	while (start > 0 && source[start - 1] !== "\n") {
		start--;
	}

	return start;
}
