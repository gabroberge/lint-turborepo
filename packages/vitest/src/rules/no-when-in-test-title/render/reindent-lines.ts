/**
 * Rewrite each non-empty line by stripping `prefix` and applying
 * `contentIndent`. Empty lines stay empty. Returns `null` when a non-empty
 * line does not start with `prefix`.
 */
export function reindentLines(lines: string[], prefix: string, contentIndent: string): string[] | null {
	const rendered: string[] = [];

	for (const line of lines) {
		if (line.trim() === "") {
			rendered.push("");
			continue;
		}

		if (!line.startsWith(prefix)) {
			return null;
		}

		rendered.push(contentIndent + line.slice(prefix.length));
	}

	return rendered;
}
