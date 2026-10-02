const IGNORED_KEYS = new Set([
	"loc",
	"range",
	"start",
	"end",
	"parent",
	"leadingComments",
	"trailingComments",
	"innerComments",
	"comments",
	"extra"
]);

/**
 * Authored view of an AST. Location, comments, and parser metadata are
 * dropped so formatting does not distinguish two trees. Object keys are
 * sorted. Functions are omitted. `bigint` and `RegExp` are encoded because
 * JSON cannot hold them.
 */
export function authoredTree(value: unknown): unknown {
	if (typeof value === "bigint") {
		return `${value}n`;
	}

	if (value instanceof RegExp) {
		return `/${value.source}/${value.flags}`;
	}

	if (value === null || typeof value !== "object") {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map((entry) => authoredTree(entry));
	}

	const result: Record<string, unknown> = {};
	for (const key of Object.keys(value).sort()) {
		if (IGNORED_KEYS.has(key)) {
			continue;
		}

		const child = (value as Record<string, unknown>)[key];
		if (typeof child === "function") {
			continue;
		}

		result[key] = authoredTree(child);
	}

	return result;
}
