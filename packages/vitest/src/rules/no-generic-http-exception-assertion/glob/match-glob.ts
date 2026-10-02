import { basename } from "./basename";
import { globToRegExp } from "./glob-to-reg-exp";

/**
 * Minimal glob matcher supporting `*`, `?`, and `**` (including empty segments)
 * so patterns like `**` + `/*.spec.ts` match both `handler.spec.ts` and nested paths.
 */
export function matchGlob(filename: string, pattern: string): boolean {
	const normalizedPattern = pattern.replaceAll("\\", "/");
	const regex = globToRegExp(normalizedPattern);
	if (regex.test(filename)) {
		return true;
	}

	const base = basename(filename);
	return base !== filename && regex.test(base);
}
