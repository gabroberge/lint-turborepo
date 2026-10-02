import type { Source } from "../fix/analyze";

export function requireSource(source: Source | null): Source {
	if (source === null) {
		throw new Error("expected a safe analysis");
	}

	return source;
}
