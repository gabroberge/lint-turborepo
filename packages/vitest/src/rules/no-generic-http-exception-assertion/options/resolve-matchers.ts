import { DEFAULT_MATCHERS } from "./default-matchers";

export function resolveMatchers(matchers: string[] | undefined): ReadonlySet<string> {
	if (matchers === undefined || matchers.length === 0) {
		return DEFAULT_MATCHERS;
	}

	return new Set([...DEFAULT_MATCHERS, ...matchers]);
}
