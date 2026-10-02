/** Record a local or export lookup. False when the pair was already seen or the chain is too long. */
export function markVisit(visited: Set<string>, kind: "export" | "local", file: string, name: string): boolean {
	if (visited.size > 32) {
		return false;
	}

	const key = `${kind}:${file}:${name}`;
	if (visited.has(key)) {
		return false;
	}

	visited.add(key);
	return true;
}
